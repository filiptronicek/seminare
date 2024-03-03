import dayjs from "dayjs";
import { useMemo } from "react";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/dates";
import { SingleSeminarOptionListing } from "./SingleSeminarOptionListing";
import { parseSeminarMeta, parseSeminarOptionMeta } from "~/utils/seminars";

type Props = {
    id: string;
};
export const SingleSeminar = ({ id }: Props) => {
    const { data: event, error } = api.events.get.useQuery({ id });
    const { data: options, error: optionsError } = api.eventOptions.list.useQuery({
        id,
    });

    const seminarMetadata = useMemo(() => {
        if (!event?.metadata) return null;

        return parseSeminarMeta(event.metadata);
    }, [event]);

    const { data: selectedOptions, refetch: refetchSelected } = api.eventOptions.listStudentOptions.useQuery({
        eventId: id,
    });

    const hoursSelected = useMemo(() => {
        if (!selectedOptions) return 0;

        return selectedOptions.reduce((acc, option) => {
            const { hoursPerWeek } = parseSeminarOptionMeta(option.metadata);

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

                    <span className="font-bold">
                        Zbývající hodiny k vybrání: {(seminarMetadata?.requiredHours ?? 0) - hoursSelected}
                    </span>

                    <span className="mt-6">{event.description}</span>

                    {options && (
                        <div className="mt-8">
                            <ul className="flex flex-wrap gap-4 justify-start">
                                {options.map((option) => {
                                    const optionMeta = parseSeminarOptionMeta(option.metadata);
                                    const canSelect =
                                        optionMeta.hoursPerWeek <=
                                        (seminarMetadata?.requiredHours ?? 0) - hoursSelected;

                                    return (
                                        <SingleSeminarOptionListing
                                            key={option.id}
                                            refetchSelected={refetchSelected}
                                            event={event}
                                            option={option}
                                            selected={selectedOptions}
                                            canSelect={canSelect}
                                        />
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </section>
            )}
        </>
    );
};
