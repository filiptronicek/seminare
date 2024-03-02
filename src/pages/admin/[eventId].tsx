import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { EventOptionTable } from "@/components/admin/EventOptionTable";
import { api } from "~/utils/api";

import { EventSettingsForm } from "@/components/admin/EventSettingsForm";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";

export default function EventOption() {
    const { query } = useRouter();
    const eventId = query.eventId as string;

    const { data: event } = api.singleEvent.getEvent.useQuery({ id: eventId });
    const generateExcel = api.singleEvent.generateExcel.useMutation();

    const handleDownload = useCallback(() => {
        generateExcel.mutate(
            { eventId },
            {
                onSuccess: (data) => {
                    const link = document.createElement("a");
                    link.href = data.dataUrl;
                    link.download = `event-${eventId}.xlsx`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                },
            },
        );
    }, [eventId, generateExcel]);

    if (!eventId || !event) {
        return <Loader2 className="animate-spin" />;
    }

    return (
        <section className="flex min-h-screen flex-col items-start gap-8">
            <EventSettingsForm event={event} />
            <EventOptionTable id={eventId} />
            <Button onClick={handleDownload}>Stáhnout jako excelovou tabulku</Button>
        </section>
    );
}
