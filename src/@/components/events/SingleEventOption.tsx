import type { Event, SingleEventOption } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import { endOfDay } from "date-fns";
import dayjs from "dayjs";
import czechLocale from "dayjs/locale/cs";
import calendar from "dayjs/plugin/calendar";
import { Loader2, Maximize2, TicketMinus, TicketPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "~/utils/api";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "../ui/use-toast";
import type { SeminarOptionEnrichedWithUserCount } from "~/utils/schemas";
import { formatFreeSpots } from "~/utils/display";

dayjs.extend(calendar);
dayjs.locale(czechLocale);

type Props = {
    option: SeminarOptionEnrichedWithUserCount;
    selected?: SingleEventOption[];
    event: Event;
    refetchSelected: () => void;
};
export const SingleOption = ({ option, selected, event, refetchSelected }: Props) => {
    const { data: user } = api.user.get.useQuery();

    const registerMutation = api.eventOptions.join.useMutation();
    const leaveMutation = api.eventOptions.leave.useMutation();

    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

    const isOptionSelected = useMemo(() => {
        return selected?.some((selectedOption) => selectedOption.id === option.id);
    }, [selected, option.id]);
    const noOptionSelected = selected?.length === 0;

    const isSignupOpen = useMemo(() => {
        const currentDate = dayjs();

        if (!event.signupStartDate || !event.signupEndDate) {
            return false;
        }

        return (
            currentDate.isAfter(dayjs(event.signupStartDate)) &&
            currentDate.isBefore(dayjs(endOfDay(event.signupEndDate)))
        );
    }, [event.signupStartDate, event.signupEndDate]);

    const buttonShown = useMemo<boolean>(() => {
        if (!user?.class) return false;
        if (event.visibleToClasses && event.visibleToClasses.length > 0 && !event.visibleToClasses.includes(user.class))
            return false;
        if (option.maxParticipants !== null && option._count.students >= option.maxParticipants && !isOptionSelected)
            return false;

        return isSignupOpen && (noOptionSelected || isOptionSelected || event.allowMultipleSelections);
    }, [event, option, isOptionSelected, isSignupOpen, noOptionSelected, user]);

    const isLoading = useMemo(() => {
        return registerMutation.isLoading || leaveMutation.isLoading;
    }, [registerMutation.isLoading, leaveMutation.isLoading]);

    const handleUpdate = async () => {
        const change = isOptionSelected ? "leave" : "join";
        if (change === "leave") {
            await leaveMutation.mutateAsync(
                { optionId: option.id },
                {
                    onError: (error) => {
                        toast({
                            title: "Nepodařilo se odhlásit",
                            description: error.message,
                        });
                    },
                    onSuccess: () => {
                        refetchSelected();
                        toast({
                            title: "Odhlášení proběhlo úspěšně",
                            description: `Byl jsi odhlášen z ${option.title}`,
                        });
                    },
                },
            );
        } else {
            await registerMutation.mutateAsync(
                { optionId: option.id },
                {
                    onError: (error) => {
                        toast({
                            title: "Nepodařilo se přihlásit",
                            description: error.message,
                        });
                    },
                    onSuccess: () => {
                        refetchSelected();
                        toast({
                            title: "Přihlášení proběhlo úspěšně",
                            description: `Byl jsi přihlášen na ${option.title}`,
                        });
                    },
                },
            );
        }
    };

    const remainingSpots = option.maxParticipants !== null ? option.maxParticipants - option._count.students : null;

    return (
        <Card key={option.id} className="flex min-h-[10rem] w-96 flex-col justify-between">
            <CardHeader className="space-y-1">
                <CardTitle className="flex items-baseline justify-between text-base">
                    <h2 className="text-2xl">{option.title}</h2>
                    {option.maxParticipants !== null &&
                        (remainingSpots !== null ?
                            remainingSpots <= 0 ?
                                <span className="text-red-500">
                                    Plno ({option._count.students}/{option.maxParticipants})
                                </span>
                            :   <span className="text-green-500">
                                    {formatFreeSpots(remainingSpots - (isOptionSelected ? 1 : 0))}
                                </span>
                        :   <span className="text-gray-500">Nelze určit</span>)}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-5">
                <div className="flex w-full items-center gap-2 *:w-full">
                    {option.description && (
                        <Button
                            onClick={() => setIsDetailsDialogOpen(true)}
                            className="my-2 flex max-w-sm gap-2"
                            variant={"secondary"}
                        >
                            Zobrazit anotaci
                            <Maximize2 className="size-4" />
                        </Button>
                    )}
                    {buttonShown && (
                        <Button
                            disabled={isLoading}
                            onClick={handleUpdate}
                            variant={isOptionSelected ? "destructiveSecondary" : "default"}
                            className="flex gap-2"
                        >
                            {isLoading ?
                                <Loader2 className="size-4 animate-spin" />
                            : isOptionSelected ?
                                <TicketMinus className="size-4" />
                            :   <TicketPlus className="size-4" />}
                            {isOptionSelected ? "Odhlásit se" : "Přihlásit se"}
                        </Button>
                    )}
                </div>
                {isOptionSelected && !buttonShown && <span className="font-bold text-green-500">Tebou zvoleno</span>}
            </CardContent>
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="max-h-[90%] max-w-2xl overflow-y-scroll">
                    <DialogHeader>
                        <DialogTitle>Možnost: {option.title}</DialogTitle>
                    </DialogHeader>
                    <p className="max-w-3xl whitespace-pre-line text-balance">{option.description}</p>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
