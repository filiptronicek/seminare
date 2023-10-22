import type { SingleEventOption } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

import dayjs from "dayjs";
import czechLocale from "dayjs/locale/cs";
import calendar from "dayjs/plugin/calendar";
import { toast } from "./use-toast";
import { ClipboardSignature, Loader2 } from "lucide-react";
import { Button } from "./button";
import { useState } from "react";

dayjs.extend(calendar);
dayjs.locale(czechLocale);

interface OptionProps {
    option: SingleEventOption;
}

export const SingleOption = ({ option }: OptionProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSignup = () => {
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Přihlášení proběhlo úspěšně",
                description: "Těšíme se na tebe!",
            });
        }, 2500);
    };

    return (
        <Card key={option.id} className="max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Button disabled={isLoading} onClick={handleSignup}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <ClipboardSignature className="mr-2 h-4 w-4" />
                    )}
                    Přihlásit se
                </Button>
            </CardContent>
        </Card>
    );
};
