import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Event } from "@prisma/client";
import { Checkbox } from "../ui/checkbox";
import { type CheckedState } from "@radix-ui/react-checkbox";
import { Loader2 } from "lucide-react";
import { singleEventSchema as formSchema } from "~/utils/schemas";
import { EVENT_TYPE, type Class } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type Props = {
    event?: Event;
    isLoading: boolean;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
};
export const EventSettingsForm = ({ event, isLoading, onSubmit }: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: event?.title,
            description: event?.description ?? undefined,
            allowMultipleSelections: event?.allowMultipleSelections ?? false,
            visibleToClasses: (event?.visibleToClasses as Class[]) ?? [],
            signupEndDate: event?.signupEndDate ?? undefined,
            signupStartDate: event?.signupStartDate ?? undefined,
            type: (event?.type as EVENT_TYPE) ?? EVENT_TYPE.UNSPECIFIED,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Název</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormDescription>Název akce, který bude zobrazen na seznamu akcí.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Popis</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormDescription>Popis akce, který bude zobrazen na detailu akce.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="allowMultipleSelections"
                    render={({ field }) => {
                        const newField = {
                            onCheckedChange: (state: CheckedState) => {
                                field.onChange(state === true);
                            },
                            checked: field.value,
                            ref: field.ref,
                        };

                        return (
                            <FormItem>
                                <div className="flex items-center">
                                    <FormControl>
                                        <Checkbox className="mr-2" {...newField} />
                                    </FormControl>
                                    <FormLabel>Více možností na uživatele</FormLabel>
                                </div>
                                <FormDescription>
                                    Umožnit uživatelům zvolit více možností této jedné akce.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => {
                        const fieldProps = {
                            onValueChange: (value: string) => {
                                field.onChange(value as EVENT_TYPE);
                            },
                            value: field.value,
                            ref: field.ref,
                        };

                        return (
                            <FormItem>
                                <div className="flex items-center space-x-4">
                                    <FormLabel>Typ Akce</FormLabel>
                                    <FormControl>
                                        <Select {...fieldProps}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Vyberte..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={EVENT_TYPE.PROJECT_WEEK}>
                                                    Projektový týden
                                                </SelectItem>
                                                <SelectItem value={EVENT_TYPE.SEMINAR}>Semináře</SelectItem>
                                                <SelectItem value={EVENT_TYPE.WANDERTAG}>Wandertag</SelectItem>
                                                <SelectItem value={EVENT_TYPE.UNSPECIFIED}>Jiné</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </div>
                                <FormDescription>Na co se budou studenti přihlašovat?</FormDescription>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />

                <FormField
                    control={form.control}
                    name="visibleToClasses"
                    render={({ field }) => {
                        const fieldProps = {
                            onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                                const parsed = event.target.value.split(",").map((v) => v.trim());

                                field.onChange(parsed);
                            },
                            value: field.value.join(", "),
                            ref: field.ref,
                        };

                        return (
                            <FormItem>
                                <FormLabel>Omezení tříd</FormLabel>
                                <FormControl>
                                    <Input placeholder="" {...fieldProps} />
                                </FormControl>
                                <FormDescription className="max-w-md">
                                    Třídy, které mohou tuto Akci vidět a přihlašovat se na ni. Pokud je pole prázdné,
                                    Akce je dostupná pro všechny.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />

                <Button type="submit">
                    {isLoading ?
                        <Loader2 className="animate-spin" />
                    :   "Uložit"}
                </Button>
            </form>
        </Form>
    );
};
