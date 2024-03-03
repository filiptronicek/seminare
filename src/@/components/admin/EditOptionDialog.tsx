import { api } from "~/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { type z } from "zod";
import { type singleOptionSchema } from "~/utils/schemas";
import { useCallback } from "react";
import { toast } from "../ui/use-toast";
import { OptionSettingsForm } from "./OptionForm";
import { type SingleEventOption, type Event } from "@prisma/client";

type Props = {
    open: boolean;
    event: Event;
    option: SingleEventOption;
    onOpenChange: (value: boolean) => void;
    refetch: () => void;
};
export const EditOptionDialog = ({ open, event, option, onOpenChange, refetch }: Props) => {
    const utils = api.useContext();
    const updateOption = api.eventOptions.update.useMutation();
    const deleteOption = api.eventOptions.delete.useMutation();

    const handleSubmit = useCallback(
        (values: z.infer<typeof singleOptionSchema>) => {
            updateOption.mutate(
                {
                    id: option.id,
                    data: values,
                },
                {
                    onSuccess: () => {
                        void utils.eventOptions.list.invalidate({ id: option.id }).then(() => {
                            refetch();
                            onOpenChange(false);
                        });
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
        [updateOption, option.id, utils.eventOptions.list, refetch, onOpenChange],
    );

    const handleDelete = useCallback(() => {
        deleteOption.mutate(
            { optionId: option.id },
            {
                onSuccess: () => {
                    void utils.eventOptions.list.invalidate({ id: option.id }).then(() => {
                        refetch();
                        onOpenChange(false);
                    });
                },
            },
        );
    }, [deleteOption, onOpenChange, option.id, refetch, utils.eventOptions.list]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90%] overflow-y-scroll max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Upravit možnost</DialogTitle>
                    <OptionSettingsForm
                        option={option}
                        event={event}
                        isLoading={updateOption.isLoading}
                        onSubmit={handleSubmit}
                        onDelete={handleDelete}
                    />
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
