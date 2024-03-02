import { Loader2 } from "lucide-react";
import { api } from "~/utils/api";
import { EventTable } from "../@/components/admin/DataTable";

export default function Home() {
    const { isError, data: events, isLoading } = api.events.listEvents.useQuery({});

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (isError || !events) {
        return "Naskytla se chyba v načítání dat";
    }

    return (
        <section className="flex min-h-screen flex-col items-start">
            <EventTable />
        </section>
    );
}
