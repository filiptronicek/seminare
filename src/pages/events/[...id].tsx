import { SingleOption } from "@/components/ui/SingleEventOption";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { api } from "~/utils/api";

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

    return (
        <>
            {(error ?? optionsError) && <div>failed to load</div>}
            {event && (
                <section>
                    <h1 className="text-4xl font-bold">{event.title}</h1>
                    <p>{event.description}</p>

                    {event.allowMultipleSelections && (
                        <p className="mt-4">
                            <span className="font-bold">Poznámka:</span> Můžeš se přihlásit na více možností.
                        </p>
                    )}

                    {options && (
                        <div className="mt-8">
                            <ul className="flex flex-wrap gap-4 justify-around">
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
