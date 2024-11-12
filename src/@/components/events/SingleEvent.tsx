import dayjs from "dayjs";
import { useMemo } from "react";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/dates";
import { SingleOption } from "./SingleEventOption";
import { Button } from "../ui/button";
import Link from "next/link";
import { Pen } from "lucide-react";

type Props = {
    id: string;
};
export const SingleEvent = ({ id }: Props) => {
    const { data: event, error } = api.event.get.useQuery({ id });
    const { data: options, error: optionsError } = api.eventOptions.list.useQuery({
        id,
    });
    const { data: student } = api.user.get.useQuery();
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

    const intlFormatter = useMemo(() => new Intl.RelativeTimeFormat("cs", { numeric: "auto" }), []);
    const formattedSignUpStartDate = useMemo<string>(() => {
        if (!event) return "";
        const dayDiff = dayjs(event.signupStartDate).startOf("day").diff(dayjs().startOf("day"), "days");
        if (dayDiff < 7) {
            return intlFormatter.format(dayDiff, "day");
        }

        return formatDate(dayjs(event.signupEndDate));
    }, [event, intlFormatter]);
    const formattedSignUpEndDate = useMemo<string>(() => {
        if (!event) return "";
        const dayDiff = dayjs(event.signupEndDate).startOf("day").diff(dayjs().startOf("day"), "days");
        if (dayDiff < 7) {
            return intlFormatter.format(dayDiff, "day");
        }

        return formatDate(dayjs(event.signupEndDate));
    }, [event, intlFormatter]);

    if (error || optionsError) {
        return <div>Chyba v načítání: {error?.message ?? optionsError?.message}</div>;
    }

    return (
        <>
            {event && (
                <section>
                    <header className="flex justify-between">
                        <h1 className="text-4xl font-bold my-4">{event.title}</h1>
                        {student?.admin && (
                            <Button variant={"secondary"} asChild className="flex items-center gap-2 w-28">
                                <Link href={`/admin/events/${event.id}`}>
                                    <Pen size={16} /> Upravit
                                </Link>
                            </Button>
                        )}
                    </header>

                    {event.allowMultipleSelections && (
                        <p className="my-1">
                            <span className="font-bold">Poznámka:</span> Můžeš se přihlásit na více možností.
                        </p>
                    )}

                    <span className="font-bold">
                        {isSignupOpen ?
                            <>
                                {/* todo: convert to `<time>` */}
                                Přihlašování končí {formattedSignUpEndDate}
                            </>
                        : signupInThePast ?
                            <>Přihlašování skončilo {formattedSignUpEndDate}</>
                        :   <>Přihlašování začíná {formattedSignUpStartDate}</>}
                    </span>

                    <br className="mb-4" />

                    <span className="mt-6 whitespace-pre-line text-balance max-w-3xl">{event.description}</span>

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
