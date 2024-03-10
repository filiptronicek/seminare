import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Event, type SingleEventOption } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { singleOptionSchema } from "~/utils/schemas";
import { parseSeminarMetaSafe, parseSeminarOptionMetaSafe } from "~/utils/seminars";
import { EVENT_TYPE } from "~/utils/constants";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useMemo } from "react";

type Props = {
    option?: SingleEventOption;
    event: Event;
    isLoading: boolean;
    onSubmit: (values: z.infer<typeof singleOptionSchema>) => void;
    onDelete?: () => void;
};
export const OptionSettingsForm = ({ option, event, isLoading, onSubmit, onDelete }: Props) => {
    const seminarMetadata = useMemo(() => parseSeminarMetaSafe(event.metadata), [event.metadata]);

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
                            <FormDescription>
                                Název možnosti, který bude zobrazen na stránce přihlašování.
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
                                <Textarea {...field} />
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
                    <>
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
                                    <FormDescription>
                                        Kolik hodin týdně zabírá tento předmět v rozvrhu žáka?
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="metadata.branch"
                            render={({ field }) => {
                                const fieldProps = {
                                    onValueChange: (value: string) => {
                                        field.onChange(value);
                                    },
                                    value: field.value,
                                    ref: field.ref,
                                };

                                return (
                                    <FormItem>
                                        <FormLabel>Větev</FormLabel>
                                        <FormControl>
                                            <Select {...fieldProps}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Vyberte..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {seminarMetadata?.availableBranches.map((branch) => (
                                                        <SelectItem key={branch.id} value={branch.id}>
                                                            {branch.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>
                                            Pod jakou větev by měl být tento předmět zařazen?
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                    </>
                )}

                <div className="flex justify-between space-x-4">
                    {option && (
                        <Button type="button" variant="destructive" onClick={onDelete}>
                            Odstranit
                        </Button>
                    )}
                    <Button type="submit" disabled={!form.formState.isDirty}>
                        {isLoading ?
                            <Loader2 className="animate-spin" />
                        :   "Uložit"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
