/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useUser } from "~/utils/hooks";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getUserName } from "~/utils/user";
import { Button } from "@/components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACCESSIBLE_CLASSES } from "~/utils/constants";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";

const FormSchema = z.object({
    currentClass: z.string({
        required_error: "Třída musí být zvolena.",
    }),
});

export const ClassForm = () => {
    const updateMutation = api.userSettings.changeStudentClass.useMutation();
    const {
        data: student,
        isLoading: isStudentLoading,
        isError: isStudentError,
        refetch,
    } = api.events.getStudent.useQuery();
    const utils = api.useContext();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        updateMutation.mutate(
            { class: data.currentClass },
            {
                onSuccess: () => {
                    void utils.events.getStudent.invalidate();

                    toast({
                        title: "Třída byla úspěšně změněna",
                    });

                    void refetch();
                },
            },
        );
    };

    if (isStudentLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (isStudentError) {
        return "Nastal problém s načítáním uživatelských informací.";
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid w-full max-w-sm items-center gap-1.5 space-y-6"
            >
                <FormField
                    control={form.control}
                    name="currentClass"
                    defaultValue={student?.class ?? undefined}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Třída</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {[...ACCESSIBLE_CLASSES].map((item) => (
                                        <SelectItem key={item} value={item}>
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Vyber si svou třídu.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Uložit</Button>
            </form>
        </Form>
    );
};

export default function Settings() {
    const { data: user } = useUser();
    if (!user) {
        return null;
    }

    return (
        <section className="flex flex-col h-full items-center justify-center">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                <h1 className="text-3xl">Nastavení</h1>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="name">Jméno</Label>
                    <Input
                        type="name"
                        id="name"
                        placeholder="Tvoje jméno"
                        value={getUserName(user)}
                        disabled
                        readOnly
                    />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="email">E-mail</Label>
                    <Input type="email" id="email" placeholder="Tvůj e-mail" value={user?.email} disabled readOnly />
                </div>
                <ClassForm />
            </div>
        </section>
    );
}
