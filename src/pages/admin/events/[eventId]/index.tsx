import { Eye, FileDown, Loader2 } from "lucide-react";
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
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function Event() {
    const { query, push } = useRouter();
    const eventId = query.eventId as string;

    const { data: event } = api.event.get.useQuery({ id: eventId });
    const updateEvent = api.event.update.useMutation();
    const generateExcel = api.event.generateExcel.useMutation();
    const deleteEvent = api.event.delete.useMutation();

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
                    void push("/admin/events");
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
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/admin/events/">Akce</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/admin/events/${eventId}`}>{event.title}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className="flex justify-between items-start w-full">
                <EventSettingsForm event={event} onSubmit={handleFormSubmit} isLoading={updateEvent.isLoading} />
                <Button variant={"secondary"} asChild className="flex items-center gap-2">
                    <Link href={`/events/${event.id}`}>
                        <Eye size={16} /> Zobrazit náhled
                    </Link>
                </Button>
            </div>
            <div className="w-full max-w-2xl">
                <EventOptionTable event={event} />
            </div>
            <div className="flex gap-3">
                <Button onClick={handleDownload} className="flex gap-2">
                    <FileDown />
                    Stáhnout jako .xlsx
                </Button>
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
