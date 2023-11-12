import type { Event, SingleEventOption } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

import dayjs from "dayjs";
import czechLocale from "dayjs/locale/cs";
import calendar from "dayjs/plugin/calendar";
import { toast } from "./use-toast";
import { ClipboardSignature, Loader2 } from "lucide-react";
import { Button } from "./button";
import { useMemo, useState } from "react";
import { api } from "~/utils/api";

dayjs.extend(calendar);
dayjs.locale(czechLocale);

interface OptionProps {
    option: SingleEventOption;
    selected: SingleEventOption[] | undefined;
    refetchSelected: () => void;
    event: Event;
}

export const SingleOption = ({ option, selected, event, refetchSelected }: OptionProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const registerMutation = api.singleEvent.joinOption.useMutation();
    const leaveMutation = api.singleEvent.leaveOption.useMutation();

    const isOptionSelected = useMemo(() => {
        return selected?.some((selectedOption) => selectedOption.id === option.id);
    }, [selected, option.id]);
    const noOptionSelected = useMemo(() => selected?.length === 0, [selected]);

    const handleUpdate = async () => {
        const change = isOptionSelected ? "leave" : "join";
        setIsLoading(true);

        if (change === "leave") {
            await leaveMutation.mutateAsync({ optionId: option.id });
        } else {
            await registerMutation.mutateAsync({ optionId: option.id });
        }

        setIsLoading(false);
        refetchSelected();
        toast({
            title: `${change === "join" ? "Přihlášení" : "Odhlášení"} proběhlo úspěšně`,
            description: `Byl jsi ${change === "join" ? "přihlášen na" : "odhlášen z"} ${option.title}`,
        });
    };

    return (
        <Card key={option.id} className="max-w-md min-h-[14rem]">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">{option.title}</CardTitle>
                <CardDescription className="truncate-3-lines">{option.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {(noOptionSelected || isOptionSelected || event.allowMultipleSelections) && (
                    <Button disabled={isLoading} onClick={handleUpdate}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <ClipboardSignature className="mr-2 h-4 w-4" />
                        )}
                        {isOptionSelected ? "Odhlásit se" : "Přihlásit se"}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};
