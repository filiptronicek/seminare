"use client";

import { EventList } from "@/components/events/EventList";
import { ClassDialog } from "@/components/user/ClassDialog";
import { Loader2 } from "lucide-react";
import { api } from "~/utils/api";

export default function Home() {
    const { data: user, isLoading, error } = api.user.get.useQuery();

    if (error || (!user && !isLoading)) {
        return "Naskytla se chyba v načítání uživatelských dat: " + error?.message;
    }

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (!user?.class) {
        return <ClassDialog />;
    }

    return (
        <section className="flex min-h-screen flex-col items-start">
            <EventList user={user} />
        </section>
    );
}
