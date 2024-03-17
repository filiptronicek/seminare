import { useState } from "react";
import { NewEventDialog } from "@/components/admin/NewEventDialog";
import { UserTable } from "@/components/admin/users/UserTable";

export default function Home() {
    const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

    return (
        <section className="flex min-h-screen flex-col items-start gap-8">
            <div className="flex items-center justify-between w-full">
                <h1 className="text-3xl font-bold">Správa Uživatelů</h1>
                <NewEventDialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen} />
            </div>
            <p>Správa uživatelů, kteří se v minulosti do aplikace přihlásili.</p>
            <UserTable />
        </section>
    );
}
