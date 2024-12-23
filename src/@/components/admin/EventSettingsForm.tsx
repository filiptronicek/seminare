import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Event } from "@prisma/client";
import { Checkbox } from "../ui/checkbox";
import { type CheckedState } from "@radix-ui/react-checkbox";
import { CalendarIcon, Loader2, Trash } from "lucide-react";
import { classSchema, singleEventSchema as formSchema } from "~/utils/schemas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { formatDate } from "~/utils/dates";
import { type Class, EVENT_TYPE, DEFAULT_AVAILABLE_BRANCHES, CLASSES } from "~/utils/constants";
import { abc, displayEventType } from "~/utils/display";
import { parseSeminarMetaSafe } from "~/utils/seminars";
import { Textarea } from "../ui/textarea";
import { useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

type FormValues = z.infer<typeof formSchema>;
type Props = {
    event?: Event;
    isLoading: boolean;
    onSubmit: (values: FormValues) => void;
};
export const EventSettingsForm = ({ event, isLoading, onSubmit }: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: event?.title,
            description: event?.description ?? undefined,
            allowMultipleSelections: event?.allowMultipleSelections ?? false,
            visibleToClasses: (event?.visibleToClasses as Class[]) ?? [],
            signup: {
                from: event?.signupStartDate ?? undefined,
                to: event?.signupEndDate ?? undefined,
            },
            happening: {
                from: event?.startDate ?? undefined,
                to: event?.endDate ?? undefined,
            },
            type: (event?.type as EVENT_TYPE) ?? EVENT_TYPE.UNSPECIFIED,
            metadata: parseSeminarMetaSafe(event?.metadata),
        },
    });
    const eventIsSeminar = form.getValues("type") === EVENT_TYPE.SEMINAR;

    // We want to always default to allowMultipleSelections true for seminars, because it's expected.
    useEffect(() => {
        if (eventIsSeminar) {
            form.setValue("allowMultipleSelections", true);
        }
    }, [eventIsSeminar, form]);

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
                                <Textarea {...field} />
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
                            <FormItem className="flex flex-col gap-1">
                                <FormLabel>Typ Akce</FormLabel>
                                <FormControl>
                                    <Select {...fieldProps}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Vyberte..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(EVENT_TYPE).map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {displayEventType(type)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormDescription>Na co se budou studenti přihlašovat?</FormDescription>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />

                <FormField
                    control={form.control}
                    name="signup"
                    render={({ field }) => {
                        return (
                            <FormItem className="flex flex-col gap-1">
                                <FormLabel>Přihlášky</FormLabel>
                                <FormControl>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground",
                                                    )}
                                                >
                                                    {field.value.from ?
                                                        field.value.to ?
                                                            <>
                                                                {formatDate(field.value.from)} -{" "}
                                                                {formatDate(field.value.to)}
                                                            </>
                                                        :   formatDate(field.value.from)
                                                    :   <span>Vyberte datum</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="range"
                                                defaultMonth={field.value.from}
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormDescription className="max-w-md">
                                    Rozmezí dat, mezi kterými se dá na Akci přihlásit.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />

                <FormField
                    control={form.control}
                    name="happening"
                    render={({ field }) => {
                        return (
                            <FormItem className="flex flex-col gap-1">
                                <FormLabel>Konání</FormLabel>
                                <FormControl>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground",
                                                    )}
                                                >
                                                    {field.value.from ?
                                                        field.value.to ?
                                                            <>
                                                                {formatDate(field.value.from)} -{" "}
                                                                {formatDate(field.value.to)}
                                                            </>
                                                        :   formatDate(field.value.from)
                                                    :   <span>Vyberte datum</span>}
                                                    <CalendarIcon className="ml-auto size-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="range"
                                                defaultMonth={field.value.from}
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormDescription className="max-w-md">Rozmezí dat, kdy se Akce koná.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />

                {eventIsSeminar && (
                    <>
                        <FormField
                            control={form.control}
                            name="metadata.requiredHours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hodin týdně</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Kolik hodin seminářů na týden si musí studenti vybrat?
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="metadata.availableBranches"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex justify-between items-center">
                                        <FormLabel>Dostupné větve</FormLabel>
                                        <Button
                                            variant="secondary"
                                            type="button"
                                            onClick={() => {
                                                const newBranch = {
                                                    id: Math.random().toString(36).substring(7),
                                                    label: "Nepojmenovaná",
                                                    type: "unbound",
                                                };
                                                field.onChange([newBranch, ...(field.value ?? [])]);
                                            }}
                                        >
                                            Přidat větev
                                        </Button>
                                    </div>
                                    <FormControl>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead scope="col">Název</TableHead>
                                                    <TableHead scope="col">Kategorie vylučování</TableHead>
                                                    <TableHead scope="col">Možnosti</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {field.value?.length ?
                                                    field.value?.map((branch, index) => (
                                                        <TableRow key={branch.id}>
                                                            <TableCell>
                                                                <input
                                                                    value={branch.label}
                                                                    onChange={(e) => {
                                                                        const newBranch = {
                                                                            ...branch,
                                                                            label: e.target.value,
                                                                        };
                                                                        field.onChange(
                                                                            field.value?.map((b) =>
                                                                                b.id === branch.id ? newBranch : b,
                                                                            ),
                                                                        );
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Select
                                                                    onValueChange={(value) => {
                                                                        const newBranch = {
                                                                            ...branch,
                                                                            type: value ? "oneof" : "unbound",
                                                                            boundWith: value,
                                                                        };
                                                                        if (
                                                                            value === "none" &&
                                                                            "boundWith" in newBranch
                                                                        ) {
                                                                            newBranch.type = "unbound";
                                                                            // @ts-expect-error the types do not understand the relationship between the none value for `type` and the `boundWith` key
                                                                            delete newBranch.boundWith;
                                                                        }

                                                                        field.onChange(
                                                                            field.value?.map((b) =>
                                                                                b.id === branch.id ? newBranch : b,
                                                                            ),
                                                                        );
                                                                    }}
                                                                    value={
                                                                        branch.type === "oneof" ?
                                                                            branch.boundWith
                                                                        :   "none"
                                                                    }
                                                                >
                                                                    <SelectTrigger defaultValue={"none"}>
                                                                        <SelectValue placeholder="Nevylučuje se" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="none">
                                                                            Nevylučuje se
                                                                        </SelectItem>
                                                                        {field.value?.map((_, index) => {
                                                                            const letter = abc[index % abc.length]!;

                                                                            return (
                                                                                <SelectItem key={letter} value={letter}>
                                                                                    {letter}
                                                                                </SelectItem>
                                                                            );
                                                                        })}
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant={"destructiveSecondary"}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        field.onChange(
                                                                            field.value?.filter((_, i) => i !== index),
                                                                        );
                                                                    }}
                                                                >
                                                                    <span className="sr-only">Odstranit</span>
                                                                    <Trash size={16} />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                :   <TableRow>
                                                        <TableCell colSpan={3}>
                                                            <span>
                                                                Žádné větve nebyly přidány.
                                                                <Button
                                                                    variant={"link"}
                                                                    onClick={() =>
                                                                        field.onChange(DEFAULT_AVAILABLE_BRANCHES)
                                                                    }
                                                                >
                                                                    Načíst základní nastavení
                                                                </Button>
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                }
                                            </TableBody>
                                        </Table>
                                    </FormControl>
                                    <FormDescription>Obory, které mohou studenti vybrat.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}

                <FormField
                    control={form.control}
                    name="visibleToClasses"
                    render={({ field }) => {
                        const fieldProps = {
                            onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                                // We need to do manual validation here, because the zod form schema has issues with our schema.
                                const parsed = event.target.value.split(",").map((v) => v.trim());
                                if (!classSchema.safeParse(parsed.filter(Boolean)).success) {
                                    form.setError("visibleToClasses", {
                                        type: "manual",
                                        message: "Třída musí být jedna z: " + Object.values(CLASSES).join(", "),
                                    });
                                } else {
                                    form.clearErrors("visibleToClasses");
                                }

                                field.onChange(parsed);
                            },
                            value: field.value.join(","),
                            ref: field.ref,
                        };

                        return (
                            <FormItem>
                                <FormLabel>Omezení tříd</FormLabel>
                                <FormControl>
                                    <Input placeholder="1G,2G,3N" {...fieldProps} />
                                </FormControl>
                                <FormDescription className="max-w-md">
                                    Třídy, které mohou tuto Akci vidět a přihlašovat se na ni, oddělené čárkami. Pokud
                                    je pole prázdné, Akce je dostupná pro všechny.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />

                <Button type="submit" disabled={!form.formState.isDirty}>
                    {isLoading ?
                        <Loader2 className="animate-spin" />
                    :   "Uložit"}
                </Button>
            </form>
        </Form>
    );
};
