import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { singleOptionSchema } from "~/utils/schemas";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { type z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { OptionSettingsForm } from "@/components/admin/OptionForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptionParticipantsTable } from "@/components/admin/users/ParticipantsTable";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function EventOption() {
    const { query, push } = useRouter();
    const optionId = query.optionId as string;
    const eventId = query.eventId as string;

    const { data: option } = api.eventOptions.get.useQuery({ optionId });
    const { data: event } = api.event.get.useQuery({ id: eventId });

    const updateOption = api.eventOptions.update.useMutation();
    const deleteOption = api.eventOptions.delete.useMutation();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleFormSubmit = useCallback(
        (values: z.infer<typeof singleOptionSchema>) => {
            updateOption.mutate({
                id: optionId,
                data: values,
            });
        },
        [optionId, updateOption],
    );

    const handleDelete = useCallback(() => {
        deleteOption.mutate(
            { optionId },
            {
                onSuccess: () => {
                    void push(`/admin/events/${eventId}`);
                },
                onError: (error) => {
                    toast({
                        title: "Nepodařilo se smazat možnost",
                        description: error.message,
                    });
                },
            },
        );
    }, [deleteOption, push]);

    if (!optionId || !option || !event) {
        return <Loader2 className="animate-spin" />;
    }

    return (
        <section className="flex flex-col items-start gap-8 pb-8 mt-4">
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
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/admin/events/${eventId}/${optionId}`}>{option.title}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className="w-full max-w-lg">
                <Tabs defaultValue="settings" className="w-full">
                    <TabsList>
                        <TabsTrigger key={"settings"} value={"settings"}>
                            Nastavení
                        </TabsTrigger>
                        <TabsTrigger key={"participants"} value={"participants"}>
                            Účastníci
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent key={"settings"} value={"settings"}>
                        <OptionSettingsForm
                            event={event}
                            option={option}
                            onSubmit={handleFormSubmit}
                            isLoading={updateOption.isLoading}
                            onDelete={() => setIsDeleteDialogOpen(true)}
                        />
                    </TabsContent>
                    <TabsContent key={"participants"} value={"participants"}>
                        {/* todo: participants user table */}
                        <OptionParticipantsTable optionId={optionId} />
                    </TabsContent>
                </Tabs>
            </div>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-h-[90%] overflow-y-scroll max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Smazat možnost</DialogTitle>
                    </DialogHeader>
                    <p>
                        Opravdu chcete smazat možnost <code>{option.title}</code>?
                    </p>
                    <div className="flex gap-3">
                        <Button onClick={() => setIsDeleteDialogOpen(false)}>Zrušit</Button>
                        <Button variant="destructive" disabled={deleteOption.isLoading} onClick={handleDelete}>
                            Smazat
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}
