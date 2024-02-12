"use client";

/* eslint-disable @typescript-eslint/no-unsafe-call */

import { SingleEventCard } from "@/components/ui/SingleEventCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "~/utils/api";
import { ClassForm } from "../@/components/user/ClassForm";
import { Loader2 } from "lucide-react";

export default function Home() {
    const { data: user, isLoading, isError } = api.events.getStudent.useQuery();
    const events = api.events.listEvents.useQuery({ active: true, class: user?.class });

    if (!isLoading && !user?.class) {
        return (
            <Dialog open={true}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dokonči nastavení</DialogTitle>
                        <DialogDescription className="flex flex-col gap-4">
                            <span>Nastav si prosím svoji třídu, abychom ti mohli ukázat akce, které se tě týkají.</span>
                            <ClassForm />
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );
    }

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (isError || !user) {
        return "Naskytla se chyba v načítání uživatelských dat";
    }

    return (
        <section className="flex min-h-screen flex-col items-start">
            {isLoading ?
                <Skeleton className="w-[500px] h-[40px] rounded-full" />
            :   <h1 className="text-4xl font-bold">
                    Nadcházející akce pro <u>{user.class}</u>
                </h1>
            }
            <div className="mt-8 flex flex-row flex-wrap gap-3 justify-around md:justify-start">
                {events.data?.map((event) => <SingleEventCard key={event.id} event={event} />)}
            </div>
        </section>
    );
}
