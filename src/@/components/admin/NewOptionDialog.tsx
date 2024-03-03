import { api } from "~/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { type z } from "zod";
import { type singleOptionSchema } from "~/utils/schemas";
import { useCallback } from "react";
import { toast } from "../ui/use-toast";
import { OptionSettingsForm } from "./OptionForm";
import { type Event } from "@prisma/client";

type Props = {
    open: boolean;
    event: Event;
    onOpenChange: (value: boolean) => void;
    refetch: () => void;
};
export const NewOptionDialog = ({ open, event, onOpenChange, refetch }: Props) => {
    const createEvent = api.eventOptions.create.useMutation();

    const onSubmit = useCallback(
        (values: z.infer<typeof singleOptionSchema>) => {
            createEvent.mutate(
                {
                    eventId: event.id,
                    data: values,
                },
                {
                    onSuccess: () => {
                        void refetch();
                        onOpenChange(false);
                    },
                    onError: (error) => {
                        toast({
                            title: "Nepodařilo se vytvořit možnost",
                            description: error.message,
                        });
                    },
                },
            );
        },
        [createEvent, event.id, onOpenChange, refetch],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90%] overflow-y-scroll max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Nová možnost</DialogTitle>
                    <OptionSettingsForm event={event} isLoading={createEvent.isLoading} onSubmit={onSubmit} />
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
