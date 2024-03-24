import type { Event, SingleEventOption } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import dayjs from "dayjs";
import czechLocale from "dayjs/locale/cs";
import calendar from "dayjs/plugin/calendar";
import { Loader2, Maximize2, TicketMinus, TicketPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "~/utils/api";
import { parseSeminarOptionMeta } from "~/utils/seminars";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "../ui/use-toast";
import { formatFreeSpots, formatHourCount } from "~/utils/display";
import type { SeminarOptionEnrichedWithUserCount } from "~/utils/schemas";

dayjs.extend(calendar);
dayjs.locale(czechLocale);

interface Props {
    option: SeminarOptionEnrichedWithUserCount;
    selected?: SingleEventOption[];
    event: Event;
    canSelect: boolean;
    refetchSelected: () => void;
}
export const SingleSeminarOptionListing = ({ option, selected, event, canSelect, refetchSelected }: Props) => {
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
        return currentDate.isAfter(dayjs(event.signupStartDate)) && currentDate.isBefore(dayjs(event.signupEndDate));
    }, [event.signupStartDate, event.signupEndDate]);

    const buttonShown = useMemo<boolean>(() => {
        if (!user?.class) return false;
        if (event.visibleToClasses && !event.visibleToClasses.includes(user.class)) return false;
        if (option.maxParticipants !== null && option._count.students >= option.maxParticipants) return false;

        return isSignupOpen && (noOptionSelected || isOptionSelected || event.allowMultipleSelections);
    }, [event, option, isOptionSelected, isSignupOpen, noOptionSelected, user]);

    const isLoading = useMemo(() => {
        return registerMutation.isLoading || leaveMutation.isLoading;
    }, [registerMutation.isLoading, leaveMutation.isLoading]);

    const optionMeta = useMemo(() => {
        if (!option?.metadata) return null;

        return parseSeminarOptionMeta(option.metadata);
    }, [option]);

    const remainingSpots = option.maxParticipants !== null ? option.maxParticipants - option._count.students : null;

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

    return (
        <Card key={option.id} className="w-96 min-h-[10rem] flex flex-col justify-between">
            <CardHeader className="space-y-1">
                <CardTitle className="flex justify-between items-baseline text-base">
                    <h2 className="text-2xl">{option.title}</h2>
                    {option.maxParticipants !== null &&
                        (remainingSpots !== null ?
                            remainingSpots <= 0 ?
                                <span className="text-red-500">
                                    Plno ({option.maxParticipants}/{option._count.students})
                                </span>
                            :   <span className="text-green-500">
                                    {formatFreeSpots(remainingSpots - (isOptionSelected ? 1 : 0))}
                                </span>
                        :   <span className="text-gray-500">Nelze určit</span>)}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-5">
                {optionMeta?.hoursPerWeek && <span>{formatHourCount(optionMeta.hoursPerWeek)} týdně</span>}
                <div className="flex gap-2 items-center w-full *:w-full">
                    {option.description && (
                        <Button
                            onClick={() => setIsDetailsDialogOpen(true)}
                            className="flex gap-2 my-2 max-w-sm"
                            variant={"secondary"}
                        >
                            Zobrazit anotaci
                            <Maximize2 size={16} />
                        </Button>
                    )}
                    {(buttonShown || !canSelect) && (
                        <Button
                            disabled={isLoading || (!isOptionSelected && !canSelect)}
                            onClick={handleUpdate}
                            className="flex gap-2"
                            variant={isOptionSelected ? "destructiveSecondary" : "default"}
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
                {isOptionSelected && !buttonShown && <span className="text-green-500 font-bold">Tebou zvoleno</span>}
            </CardContent>
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="max-h-[90%] overflow-y-scroll max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Možnost: {option.title}</DialogTitle>
                    </DialogHeader>
                    <p className="whitespace-pre-line text-balance max-w-3xl">{option.description}</p>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
