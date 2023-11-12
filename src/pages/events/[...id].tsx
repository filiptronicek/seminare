import { SingleOption } from "@/components/ui/SingleEventOption";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/dates";

const normalizeId = (id: string | string[]) => {
    if (Array.isArray(id)) {
        return id[0]!;
    }
    return id;
};

export default function Page() {
    const router = useRouter();

    const eventId = useMemo(() => {
        return normalizeId(router.query.id!);
    }, [router.query.id]);

    const { data: event, error } = api.singleEvent.getEvent.useQuery({ id: eventId });
    const { data: options, error: optionsError } = api.singleEvent.listOptions.useQuery({
        id: eventId,
    });

    const { data: selectedOptions, refetch: refetchSelected } = api.singleEvent.listStudentOptions.useQuery({
        eventId,
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
                    <p>{event.description}</p>

                    {event.allowMultipleSelections && (
                        <p className="mt-4">
                            <span className="font-bold">Poznámka:</span> Můžeš se přihlásit na více možností.
                        </p>
                    )}

                    <span className="font-bold mt-4">
                        {isSignupOpen ? (
                            <>
                                {/* Could convert to `<time>` */}
                                Přihlašování končí {formatDate(dayjs(event.signupEndDate))}
                            </>
                        ) : (
                            signupInThePast ? (
                                <>
                                    Přihlašování skončilo {formatDate(dayjs(event.signupEndDate))}
                                </>
                            ) : (
                                <>
                                    Přihlašování začíná {formatDate(dayjs(event.signupStartDate))}
                                </>
                            )
                        )}
                    </span>

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
}
