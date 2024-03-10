import dayjs from "dayjs";
import { useMemo } from "react";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/dates";
import { SingleSeminarOptionListing } from "./SingleSeminarOptionListing";
import { parseSeminarMeta, parseSeminarOptionMeta } from "~/utils/seminars";
import { Pen } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

type Props = {
    id: string;
};
export const SingleSeminar = ({ id }: Props) => {
    const { data: event, error } = api.events.get.useQuery({ id });
    const { data: options, error: optionsError } = api.eventOptions.list.useQuery({
        id,
    });
    const { data: student } = api.user.getStudent.useQuery();

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

    const remainingToSelect = useMemo(() => {
        return (seminarMetadata?.requiredHours ?? 0) - hoursSelected;
    }, [seminarMetadata, hoursSelected]);

    if (error || optionsError) {
        return <div>Chyba v načítání</div>;
    }

    return (
        <>
            {event && (
                <section className="flex flex-col gap-1">
                    <header className="flex justify-between">
                        <h1 className="text-4xl font-bold my-4">{event.title}</h1>
                        {student?.admin && (
                            <Button variant={"secondary"} asChild className="flex items-center gap-2 w-28">
                                <Link href={`/admin/${event.id}`}>
                                    <Pen size={16} /> Upravit
                                </Link>
                            </Button>
                        )}
                    </header>

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
                        {remainingToSelect > 0 ?
                            <>
                                Zbývající hodiny k vybrání: {remainingToSelect} z {seminarMetadata?.requiredHours}
                            </>
                        :   <>Vybráno všech {seminarMetadata?.requiredHours} hodin ✔︎</>}
                    </span>

                    <span className="mt-6 whitespace-pre-line text-balance max-w-3xl">{event.description}</span>

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
