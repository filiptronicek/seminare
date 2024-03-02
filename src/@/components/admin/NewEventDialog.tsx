import { api } from "~/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { singleEventSchema } from "~/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { type CheckedState } from "@radix-ui/react-checkbox";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type Props = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
};
export const NewEventDialog = ({ open, onOpenChange }: Props) => {
    const createEvent = api.singleEvent.createEvent.useMutation();
    const form = useForm<z.infer<typeof singleEventSchema>>({
        resolver: zodResolver(singleEventSchema),
        defaultValues: {
            title: "",
            description: "",
            allowMultipleSelections: false,
        },
    });

    const onSubmit = useCallback(
        (values: z.infer<typeof singleEventSchema>) => {
            createEvent.mutate(values, {
                onSuccess: () => {
                    onOpenChange(false);
                },
                onError: (error) => {
                    toast({
                        title: "Nepodařilo se přihlásit",
                        description: error.message,
                    });
                },
            });
        },
        [onOpenChange, createEvent],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nová Akce</DialogTitle>
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
                                        <FormDescription>
                                            Název akce, který bude zobrazen na seznamu akcí.
                                        </FormDescription>
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
                                            <Input {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Popis akce, který bude zobrazen na detailu akce.
                                        </FormDescription>
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
                                                <Select>
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Theme" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="light">Light</SelectItem>
                                                        <SelectItem value="dark">Dark</SelectItem>
                                                        <SelectItem value="system">System</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
                                {createEvent.isLoading ? <Loader2 className="animate-spin" /> : "Vytvořit"}
                            </Button>
                        </form>
                    </Form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
