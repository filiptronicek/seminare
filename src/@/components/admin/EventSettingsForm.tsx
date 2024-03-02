import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCallback } from "react";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Event } from "@prisma/client";
import { Checkbox } from "../ui/checkbox";
import { type CheckedState } from "@radix-ui/react-checkbox";
import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";
import { singleEventSchema as formSchema } from "~/utils/schemas";

type Props = {
    event: Event;
};
export const EventSettingsForm = ({ event }: Props) => {
    const updateEvent = api.singleEvent.updateEvent.useMutation();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: event.title,
            description: event.description ?? "",
            allowMultipleSelections: event.allowMultipleSelections,
        },
    });

    const onSubmit = useCallback(
        (values: z.infer<typeof formSchema>) => {
            console.log(values);
            updateEvent.mutate({
                id: event.id,
                data: values,
            });
        },
        [event.id, updateEvent],
    );

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
                                <FormControl>
                                    <Checkbox className="mr-2" {...newField} />
                                </FormControl>
                                <FormLabel>Více možností na uživatele</FormLabel>
                                <FormDescription>
                                    Umožnit uživatelům zvolit více možností této jedné akce.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
                <Button type="submit">
                    {updateEvent.isLoading ?
                        <Loader2 className="animate-spin" />
                    :   "Uložit"}
                </Button>
            </form>
        </Form>
    );
};
