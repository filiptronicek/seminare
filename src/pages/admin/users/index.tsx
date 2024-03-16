import { Loader2, PlusCircle } from "lucide-react";
import { api } from "~/utils/api";
import { EventTable } from "../../../@/components/admin/EventTable";
import { useState } from "react";
import { NewEventDialog } from "@/components/admin/NewEventDialog";
import { UserTable } from "@/components/admin/users/UserTable";

export default function Home() {
    const { isError, data: events, isLoading } = api.events.list.useQuery({});
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
                <h1 className="text-3xl font-bold">Správa Uživatelů</h1>
                <NewEventDialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen} />
            </div>
            <UserTable />
        </section>
    );
}
