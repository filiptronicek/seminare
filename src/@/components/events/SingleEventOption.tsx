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

dayjs.extend(calendar);
dayjs.locale(czechLocale);

interface OptionProps {
    option: SingleEventOption;
    selected: SingleEventOption[] | undefined;
    refetchSelected: () => void;
    event: Event;
}

export const SingleOption = ({ option, selected, event, refetchSelected }: OptionProps) => {
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
        if (event.visibleToClasses && !event.visibleToClasses.includes(user.class)) return false;

        return isSignupOpen && (noOptionSelected || isOptionSelected || event.allowMultipleSelections);
    }, [event.allowMultipleSelections, event.visibleToClasses, isOptionSelected, isSignupOpen, noOptionSelected, user]);

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

    return (
        <Card key={option.id} className="w-96 min-h-[10rem] flex flex-col justify-between">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">{option.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-5">
                <div className="flex gap-2 items-center w-full *:w-full">
                    {option.description && (
                        <Button
                            onClick={() => setIsDetailsDialogOpen(true)}
                            className="flex gap-2 my-2 max-w-sm"
                            variant={"secondary"}
                        >
                            Zobrazit anotaci
                            <Maximize2 className="size-4" />
                        </Button>
                    )}
                    {buttonShown && (
                        <Button disabled={isLoading} onClick={handleUpdate} variant={isOptionSelected ? "destructiveSecondary" : "default"} className="flex gap-2">
                            {isLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : isOptionSelected ? (
                                <TicketMinus className="size-4" />
                            ) : (
                                <TicketPlus className="size-4" />
                            )}
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
