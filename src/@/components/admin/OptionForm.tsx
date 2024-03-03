import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Event, type SingleEventOption } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { singleOptionSchema } from "~/utils/schemas";
import { parseSeminarOptionMetaSafe } from "~/utils/seminars";
import { EVENT_TYPE } from "~/utils/constants";

type Props = {
    option?: SingleEventOption;
    event: Event;
    isLoading: boolean;
    onSubmit: (values: z.infer<typeof singleOptionSchema>) => void;
};
export const OptionSettingsForm = ({ option, event, isLoading, onSubmit }: Props) => {
    const form = useForm<z.infer<typeof singleOptionSchema>>({
        resolver: zodResolver(singleOptionSchema),
        defaultValues: {
            title: option?.title,
            description: option?.description ?? undefined,
            maxParticipants: option?.maxParticipants ?? undefined,
            metadata: parseSeminarOptionMetaSafe(option?.metadata),
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
                            <FormDescription>Název možnosti, který bude zobrazen na stránce přihlašování.</FormDescription>
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
                    name="maxParticipants"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Maximální počet účastníků</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder=""
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                />
                            </FormControl>
                            <FormDescription>Maximální počet účastníků, kteří se mohou přihlásit.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {event.type === EVENT_TYPE.SEMINAR.toString() && (
                    <FormField
                        control={form.control}
                        name="metadata.hoursPerWeek"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hodin týdně</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder=""
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    />
                                </FormControl>
                                <FormDescription>Kolik hodin týdně zabírá tento předmět v rozvrhu žáka?</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <Button type="submit" disabled={!form.formState.isDirty}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "Uložit"}
                </Button>
            </form>
        </Form>
    );
};
