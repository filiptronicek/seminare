import { Loader2, PlusCircle } from "lucide-react";
import { api } from "~/utils/api";
import { EventTable } from "../../@/components/admin/EventTable";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { NewEventDialog } from "@/components/admin/NewEventDialog";

export default function Home() {
    const { isError, data: events, isLoading } = api.events.listEvents.useQuery({});
    const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (isError || !events) {
        return "Naskytla se chyba v načítání dat";
    }

    return (
        <section className="flex min-h-screen flex-col items-start gap-8">
            <div className="flex items-center justify-between w-full">
                <h1 className="text-3xl font-bold">Správa Akcí</h1>
                <Button variant="secondary" className="gap-2" onClick={() => setIsNewDialogOpen(true)}>
                    <PlusCircle size={20} />
                    <span>Vytvořit akci</span>
                </Button>
                <NewEventDialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen} />
            </div>
            <EventTable />
        </section>
    );
}
