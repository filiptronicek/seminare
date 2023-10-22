import { SingleOption } from "@/components/ui/SingleEventOption";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

const normalizeId = (id: string | string[]) => {
    if (Array.isArray(id)) {
        return id[0]!;
    }
    return id;
};

export default function Page() {
    const router = useRouter();

    const { data: event, error } = api.events.getEvent.useQuery({ id: normalizeId(router.query.id!) });
    const { data: options, error: optionsError } = api.events.listEventOptions.useQuery({
        id: normalizeId(router.query.id!),
    });

    return (
        <>
            {(error ?? optionsError) && <div>failed to load</div>}
            {event && (
                <section>
                    <h1 className="text-4xl font-bold">{event.title}</h1>
                    <p>{event.description}</p>

                    {options && (
                        <div className="mt-8">
                            <ul className="flex flex-wrap gap-4 justify-around">
                                {options.map((option) => (
                                    <SingleOption key={option.id} option={option} />
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            )}
        </>
    );
}
