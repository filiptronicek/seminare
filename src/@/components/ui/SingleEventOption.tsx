import type { Event, SingleEventOption } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

import dayjs from "dayjs";
import czechLocale from "dayjs/locale/cs";
import calendar from "dayjs/plugin/calendar";
import { toast } from "./use-toast";
import { ClipboardSignature, Loader2 } from "lucide-react";
import { Button } from "./button";
import { useMemo } from "react";
import { api } from "~/utils/api";
import { cn } from "@/lib/utils";

dayjs.extend(calendar);
dayjs.locale(czechLocale);

interface OptionProps {
    option: SingleEventOption;
    selected: SingleEventOption[] | undefined;
    refetchSelected: () => void;
    event: Event;
}

export const SingleOption = ({ option, selected, event, refetchSelected }: OptionProps) => {
    const registerMutation = api.singleEvent.joinOption.useMutation();
    const leaveMutation = api.singleEvent.leaveOption.useMutation();

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
        <Card key={option.id} className="max-w-md min-h-[14rem]">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">{option.title}</CardTitle>
                <CardDescription className={cn(buttonShown ? "truncate-3-lines" : "truncate-5-lines")}>
                    {option.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {buttonShown && (
                    <Button disabled={isLoading} onClick={handleUpdate}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <ClipboardSignature className="mr-2 h-4 w-4" />
                        )}
                        {isOptionSelected ? "Odhlásit se" : "Přihlásit se"}
                    </Button>
                )}
                {
                    isOptionSelected && !buttonShown && (
                        <span className="text-green-500 font-bold">Tebou zvoleno</span>
                    )
                }
            </CardContent>
        </Card>
    );
};
