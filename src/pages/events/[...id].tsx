import { useRouter } from "next/router";
import { api } from "~/utils/api";

const normalizeId = (id: string | string[]) => {
    if (Array.isArray(id)) {
        return id[0]!;
    }
    return id;
}

export default function Page() {
    const router = useRouter();
    const { data: event, error } = api.example.getEvent.useQuery({ id: normalizeId(router.query.id!) });
    return (
        <>
            {error && <div>failed to load</div>}
            {event && (
                <div>
                    <h1>{event.title}</h1>
                    <p>{event.description}</p>
                </div>
            )}
        </>
    );
}
