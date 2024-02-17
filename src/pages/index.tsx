"use client";

import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";
import { ClassDialog } from "@/components/user/ClassDialog";
import { EventList } from "@/components/events/EventList";

export default function Home() {
    const { data: user, isLoading, isError } = api.events.getStudent.useQuery();

    if (!user?.class) {
        if (isLoading) {
            return <Loader2 className="animate-spin" />;
        }

        <ClassDialog />;
    }

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (isError || !user) {
        return "Naskytla se chyba v načítání uživatelských dat";
    }

    return (
        <section className="flex min-h-screen flex-col items-start">
            <EventList user={user} />
        </section>
    );
}
