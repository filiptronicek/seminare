import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { EventOptionTable } from "@/components/admin/EventOptionTable";
import { api } from "~/utils/api";
import { type singleEventSchema } from "~/utils/schemas";
import { EventSettingsForm } from "@/components/admin/EventSettingsForm";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { type z } from "zod";

export default function EventOption() {
    const { query } = useRouter();
    const eventId = query.eventId as string;

    const { data: event } = api.events.get.useQuery({ id: eventId });
    const updateEvent = api.events.update.useMutation();
    const generateExcel = api.events.generateExcel.useMutation();

    const handleFormSubmit = useCallback(
        (values: z.infer<typeof singleEventSchema>) => {
            updateEvent.mutate({
                id: eventId,
                data: values,
            });
        },
        [eventId, updateEvent],
    );

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
            <EventSettingsForm event={event} onSubmit={handleFormSubmit} isLoading={updateEvent.isLoading} />
            <EventOptionTable id={eventId} />
            <Button onClick={handleDownload}>Stáhnout jako excelovou tabulku</Button>
        </section>
    );
}
