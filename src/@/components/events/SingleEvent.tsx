import dayjs from "dayjs";
import { useMemo } from "react";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/dates";
import { SingleOption } from "./SingleEventOption";

type Props = {
    id: string;
};
export const SingleEvent = ({ id }: Props) => {
    const { data: event, error } = api.events.get.useQuery({ id });
    const { data: options, error: optionsError } = api.eventOptions.list.useQuery({
        id,
    });

    const { data: selectedOptions, refetch: refetchSelected } = api.eventOptions.listStudentOptions.useQuery({
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
                    <h1 className="text-4xl font-bold my-4">{event.title}</h1>

                    {event.allowMultipleSelections && (
                        <p className="my-1">
                            <span className="font-bold">Poznámka:</span> Můžeš se přihlásit na více možností.
                        </p>
                    )}

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
