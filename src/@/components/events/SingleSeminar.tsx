import dayjs from "dayjs";
import { useMemo } from "react";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/dates";
import { z } from "zod";
import { SingleSeminarOptionListing, parseSeminarOptionMeta } from "./SingleSeminarOptionListing";

const schema = z.object({
    requiredHours: z.number(),
    availableBranches: z.array(z.object({ id: z.string(), label: z.string() })),
});

const parseSeminarMeta = (data: unknown): z.infer<typeof schema> => {
    return schema.parse(data);
};

type Props = {
    id: string;
};
export const SingleSeminar = ({ id }: Props) => {
    const { data: event, error } = api.singleEvent.getEvent.useQuery({ id });
    const { data: options, error: optionsError } = api.singleEvent.listOptions.useQuery({
        id,
    });

    const seminarMetadata = useMemo(() => {
        if (!event?.metadata) return null;

        return parseSeminarMeta(event.metadata);
    }, [event]);

    const { data: selectedOptions, refetch: refetchSelected } = api.singleEvent.listStudentOptions.useQuery({
        eventId: id,
    });

    const hoursSelected = useMemo(() => {
        if (!selectedOptions) return 0;
            
        return selectedOptions.reduce((acc, option) => {
            const {hoursPerWeek} = parseSeminarOptionMeta(option.metadata);

            return acc + hoursPerWeek;
        }, 0);
    }, [selectedOptions]);

    const isSignupOpen = useMemo(() => {
        const currentDate = dayjs();
        return currentDate.isAfter(dayjs(event?.signupStartDate)) && currentDate.isBefore(dayjs(event?.signupEndDate));
    }, [event?.signupStartDate, event?.signupEndDate]);

    const signupInThePast = useMemo(() => {
        const currentDate = dayjs();
        return currentDate.isAfter(dayjs(event?.signupEndDate));
    }, [event?.signupEndDate]);

    return (
        <>
            {(error ?? optionsError) && <div>failed to load</div>}
            {event && (
                <section className="flex flex-col gap-1">
                    {event.metadata && JSON.stringify(event.metadata)}
                    <h1 className="text-4xl font-bold my-4">{event.title}</h1>

                    <span className="font-bold">
                        {isSignupOpen ?
                            <>
                                {/* todo: convert to `<time>` */}
                                Přihlašování končí {formatDate(dayjs(event.signupEndDate))}
                            </>
                        : signupInThePast ?
                            <>Přihlašování skončilo {formatDate(dayjs(event.signupEndDate))}</>
                        :   <>Přihlašování začíná {formatDate(dayjs(event.signupStartDate))}</>}
                    </span>

                    <span className="font-bold">Zbývající hodiny k vybrání: {(seminarMetadata?.requiredHours ?? 0) - hoursSelected}</span>

                    <span className="mt-6">{event.description}</span>

                    {options && (
                        <div className="mt-8">
                            <ul className="flex flex-wrap gap-4 justify-start">
                                {options.map((option) => (
                                    <SingleSeminarOptionListing
                                        key={option.id}
                                        refetchSelected={refetchSelected}
                                        event={event}
                                        option={option}
                                        selected={selectedOptions}
                                        canSelect={(seminarMetadata?.requiredHours ?? 0) > hoursSelected}
                                    />
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            )}
        </>
    );
};
