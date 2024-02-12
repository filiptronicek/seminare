import dayjs from "dayjs";
import { useMemo } from "react";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/dates";
import { SingleOption } from "../ui/SingleEventOption";
import { z } from "zod";

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
                <section>
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

                    <p>Zbývající hodiny k vybrání: {seminarMetadata?.requiredHours}</p>

                    <p className="mt-6">{event.description}</p>

                    {options && (
                        <div className="mt-8">
                            <ul className="flex flex-wrap gap-4 justify-start">
                                {options.map((option) => (
                                    <SingleOption
                                        key={option.id}
                                        refetchSelected={refetchSelected}
                                        event={event}
                                        option={option}
                                        selected={selectedOptions}
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
