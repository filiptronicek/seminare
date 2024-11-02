import { UserTable } from "@/components/admin/users/UserTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { api } from "~/utils/api";

export default function Home() {
    const [classAttributionDialogOpen, setClassAttributionDialogOpen] = useState(false);
    const resetClassAttributions = api.user.resetClassAttribution.useMutation();
    const utils = api.useUtils();
    const { refetch: refetchUsers } = api.user.list.useQuery({});

    const handleDelete = () => {
        resetClassAttributions.mutate(undefined, {
            onSuccess: async (res) => {
                setClassAttributionDialogOpen(false);
                await utils.eventOptions.list.invalidate();
                await refetchUsers();
                toast({
                    title: `Třídy byly resetovány pro ${res.count} uživatelů`,
                });
            },
            onError: (error) => {
                toast({
                    title: "Nepodařilo se resetovat třídy",
                    description: error.message,
                });
            },
        });
    };

    return (
        <section className="flex min-h-screen flex-col items-start gap-8">
            <h1 className="text-3xl font-bold">Správa Uživatelů</h1>
            <p>Správa uživatelů, kteří se v minulosti do aplikace přihlásili.</p>

            <h2 className="text-2xl">Možnosti</h2>
            <Button variant={"destructive"} onClick={() => setClassAttributionDialogOpen(true)}>
                Resetovat zaznamenané třídy
            </Button>

            <h2 className="text-2xl">Seznam uživatelů</h2>
            <UserTable />

            <Dialog open={classAttributionDialogOpen} onOpenChange={setClassAttributionDialogOpen}>
                <DialogContent className="max-h-[90%] overflow-y-scroll max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Potvrzení promazání uživatelských tříd</DialogTitle>
                        <p>
                            Opravdu chcete resetovat všechny zaznamenané třídy uživatelů? Tato akce je nevratná a vymaže
                            všechny zaznamenané třídy uživatelů. Třídy budou muset být znovu nastaveny ručně, a to buď
                            při přihlášení uživatele samotným uživatelem, nebo v administraci uživatelů jedním ze
                            správců.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <Button onClick={() => setClassAttributionDialogOpen(false)}>Zrušit</Button>
                            <Button
                                variant="destructive"
                                disabled={resetClassAttributions.isLoading}
                                onClick={handleDelete}
                            >
                                Smazat
                            </Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </section>
    );
}
