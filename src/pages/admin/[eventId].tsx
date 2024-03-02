import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { EventOptionTable } from "@/components/admin/EventOptionTable";
import { api } from "~/utils/api";

import { EventSettingsForm } from "@/components/admin/EventSettingsForm";

export default function EventOption() {
    const { query } = useRouter();
    const eventId = query.eventId as string;

    const { data: event } = api.singleEvent.getEvent.useQuery({ id: eventId });

    if (!eventId || !event) {
        return <Loader2 className="animate-spin" />;
    }

    return (
        <section className="flex min-h-screen flex-col items-start gap-8">
            <EventSettingsForm event={event} />
            <EventOptionTable id={eventId} />
        </section>
    );
}
