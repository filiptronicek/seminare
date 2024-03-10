import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { EventOptionTable } from "@/components/admin/EventOptionTable";
import { api } from "~/utils/api";
import { type singleEventSchema } from "~/utils/schemas";
import { EventSettingsForm } from "@/components/admin/EventSettingsForm";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { type z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

export default function EventOption() {
    const { query, push } = useRouter();
    const eventId = query.eventId as string;

    const { data: event } = api.events.get.useQuery({ id: eventId });
    const updateEvent = api.events.update.useMutation();
    const generateExcel = api.events.generateExcel.useMutation();
    const deleteEvent = api.events.delete.useMutation();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleFormSubmit = useCallback(
        (values: z.infer<typeof singleEventSchema>) => {
            updateEvent.mutate({
                id: eventId,
                data: values,
            });
        },
        [eventId, updateEvent],
    );

    const handleDelete = useCallback(() => {
        deleteEvent.mutate(
            { id: eventId },
            {
                onSuccess: () => {
                    void push("/admin");
                },
                onError: (error) => {
                    toast({
                        title: "Nepodařilo se smazat akci",
                        description: error.message,
                    });
                },
            },
        );
    }, [deleteEvent, eventId, push]);

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
        <section className="flex flex-col items-start gap-8 pb-8">
            <EventSettingsForm event={event} onSubmit={handleFormSubmit} isLoading={updateEvent.isLoading} />
            <div className="w-full max-w-2xl">
                <EventOptionTable event={event} />
            </div>
            <div className="flex gap-3">
                <Button onClick={handleDownload}>Stáhnout jako excelovou tabulku</Button>
                <Button onClick={() => setIsDeleteDialogOpen(true)} variant={"destructive"}>
                    Smazat Akci
                </Button>
            </div>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-h-[90%] overflow-y-scroll max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Smazat akci</DialogTitle>
                    </DialogHeader>
                    <p>
                        Opravdu chcete smazat akci <code>{event.title}</code>?
                    </p>
                    <div className="flex gap-3">
                        <Button onClick={() => setIsDeleteDialogOpen(false)}>Zrušit</Button>
                        <Button variant="destructive" disabled={deleteEvent.isLoading} onClick={handleDelete}>
                            Smazat
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}
