import type { Event, SingleEventOption } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import czechLocale from "dayjs/locale/cs";
import calendar from "dayjs/plugin/calendar";
import { Loader2, TicketMinus, TicketPlus } from "lucide-react";
import { useMemo } from "react";
import { api } from "~/utils/api";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { parseSeminarOptionMeta } from "~/utils/seminars";

dayjs.extend(calendar);
dayjs.locale(czechLocale);

const formatHourCount = (hours: number) => {
    if (hours === 1) {
        return "1 hodina";
    }
    if (hours < 5) {
        return `${hours} hodiny`;
    }
    return `${hours} hodin`;
};

interface Props {
    option: SingleEventOption;
    selected: SingleEventOption[] | undefined;
    event: Event;
    canSelect: boolean;
    refetchSelected: () => void;
}
export const SingleSeminarOptionListing = ({ option, selected, event, canSelect, refetchSelected }: Props) => {
    const registerMutation = api.eventOptions.join.useMutation();
    const leaveMutation = api.eventOptions.leave.useMutation();

    const isOptionSelected = useMemo(() => {
        return selected?.some((selectedOption) => selectedOption.id === option.id);
    }, [selected, option.id]);
    const noOptionSelected = useMemo(() => selected?.length === 0, [selected]);

    const isSignupOpen = useMemo(() => {
        const currentDate = dayjs();
        return currentDate.isAfter(dayjs(event.signupStartDate)) && currentDate.isBefore(dayjs(event.signupEndDate));
    }, [event.signupStartDate, event.signupEndDate]);

    const buttonShown = useMemo(() => {
        return isSignupOpen && (noOptionSelected || isOptionSelected || event.allowMultipleSelections);
    }, [event.allowMultipleSelections, isOptionSelected, isSignupOpen, noOptionSelected]);

    const isLoading = useMemo(() => {
        return registerMutation.isLoading || leaveMutation.isLoading;
    }, [registerMutation.isLoading, leaveMutation.isLoading]);

    const optionMeta = useMemo(() => {
        if (!option?.metadata) return null;

        return parseSeminarOptionMeta(option.metadata);
    }, [option]);

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
        <Card key={option.id} className="w-96 min-h-[14rem] flex flex-col justify-between">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">{option.title}</CardTitle>
                <CardDescription>
                    <span className={cn(buttonShown ? "truncate-3-lines" : "truncate-5-lines")}>
                        {option.description}
                    </span>
                    {optionMeta?.hoursPerWeek && <span>{formatHourCount(optionMeta.hoursPerWeek)} týdně</span>}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {(buttonShown || !canSelect) && (
                    <Button
                        disabled={isLoading || (!isOptionSelected && !canSelect)}
                        onClick={handleUpdate}
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
                {isOptionSelected && !buttonShown && <span className="text-green-500 font-bold">Tebou zvoleno</span>}
            </CardContent>
        </Card>
    );
};
