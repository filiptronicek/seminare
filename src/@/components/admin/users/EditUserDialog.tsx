import { api } from "~/utils/api";
import { type z } from "zod";
import { type singleUserSchema } from "~/utils/schemas";
import { useCallback } from "react";
import { type Student } from "@prisma/client";
import { toast } from "@/components/ui/use-toast";
import { UserForm } from "./UserForm";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";

type Props = {
    open: boolean;
    user: Student;
    onOpenChange: (value: boolean) => void;
    refetch: () => void;
};
export const EditUserDialog = ({ open, user, onOpenChange, refetch }: Props) => {
    const utils = api.useContext();

    const updateUser = api.user.update.useMutation();
    const deleteUser = api.user.delete.useMutation();

    const handleSubmit = useCallback(
        (data: z.infer<typeof singleUserSchema>) => {
            updateUser.mutate(
                {
                    id: user.id,
                    data,
                },
                {
                    onSuccess: () => {
                        void utils.eventOptions.list.invalidate({ id: user.id }).then(() => {
                            refetch();
                            onOpenChange(false);
                        });
                    },
                    onError: (error) => {
                        toast({
                            title: "Nepodařilo se upravit uživatele",
                            description: error.message,
                        });
                    },
                },
            );
        },
        [updateUser, user.id, utils.eventOptions.list, refetch, onOpenChange],
    );

    const handleDelete = useCallback(() => {
        deleteUser.mutate(
            { id: user.id },
            {
                onSuccess: () => {
                    void utils.eventOptions.list.invalidate({ id: user.id }).then(() => {
                        refetch();
                        onOpenChange(false);
                    });
                    toast({
                        title: "Uživatel byl smazán",
                    });
                },
                onError: (error) => {
                    toast({
                        title: "Nepodařilo se smazat uživatele",
                        description: error.message,
                    });
                },
            },
        );
    }, [deleteUser, user.id, utils.eventOptions.list, refetch, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90%] overflow-y-scroll max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Upravit uživatele</DialogTitle>
                    <UserForm
                        user={user}
                        isLoading={updateUser.isLoading}
                        onSubmit={handleSubmit}
                        onDelete={handleDelete}
                    />
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
