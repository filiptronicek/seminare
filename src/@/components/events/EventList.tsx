import { api } from "~/utils/api";
import type { Class } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { SingleEventCard } from "../ui/SingleEventCard";

type Props = {
    user: {
        id: string;
        class: string | null;
        fullName: string;
        avatar: string | null;
    };
};
export const EventList = ({ user }: Props) => {
    const {
        isError,
        data: events,
        isLoading,
    } = api.events.listEvents.useQuery({ active: true, class: user.class! as Class });

    if (isError) {
        return "Naskytla se chyba v načítání uživatelských dat";
    }

    if (isLoading || !events) {
        return <Loader2 className="animate-spin" />;
    }

    return (
        <>
            <h1 className="text-4xl font-bold">
                Nadcházející akce pro <u>{user.class}</u>
            </h1>
            <div className="mt-8 flex flex-row flex-wrap gap-3 justify-around md:justify-start">
                {events.map((event) => (
                    <SingleEventCard key={event.id} event={event} />
                ))}
            </div>
        </>
    );
};
