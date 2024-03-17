import { api } from "~/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { type z } from "zod";
import { type singleEventSchema } from "~/utils/schemas";
import { useCallback } from "react";
import { toast } from "../ui/use-toast";
import { EventSettingsForm } from "./EventSettingsForm";
import { useRouter } from "next/router";

type Props = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
};
export const NewEventDialog = ({ open, onOpenChange }: Props) => {
    const createEvent = api.event.create.useMutation();
    const router = useRouter();

    const onSubmit = useCallback(
        (values: z.infer<typeof singleEventSchema>) => {
            createEvent.mutate(values, {
                onSuccess: (data) => {
                    onOpenChange(false);
                    void router.push(`/admin/events/${data.id}`);
                },
                onError: (error) => {
                    toast({
                        title: "Nepodařilo se přihlásit",
                        description: error.message,
                    });
                },
            });
        },
        [createEvent, onOpenChange, router],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90%] overflow-y-scroll max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Nová Akce</DialogTitle>
                    <EventSettingsForm isLoading={createEvent.isLoading} onSubmit={onSubmit} />
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
