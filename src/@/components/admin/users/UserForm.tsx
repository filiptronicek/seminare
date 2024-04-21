import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormItem, FormLabel, FormField, FormMessage, FormDescription } from "@/components/ui/form";
import { type Student } from "@prisma/client";
import { singleUserSchema } from "~/utils/schemas";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";
import { CLASSES, type Class } from "~/utils/constants";
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { type CheckedState } from "@radix-ui/react-checkbox";

type Props = {
    user: Student;
    isLoading: boolean;
    onSubmit: (values: z.infer<typeof singleUserSchema>) => void;
    onDelete: () => void;
};
export const UserForm = ({ user, isLoading, onSubmit, onDelete }: Props) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof singleUserSchema>>({
        resolver: zodResolver(singleUserSchema),
        defaultValues: {
            role: user.admin ? "admin" : "user",
            class: user.class as Class | undefined,
            suspended: user.suspended,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormItem>
                    <FormLabel>Jméno a příjmení</FormLabel>
                    <FormControl>
                        <Input value={user.fullName} readOnly />
                    </FormControl>
                    <FormMessage />
                </FormItem>

                <FormField
                    control={form.control}
                    name="class"
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
                                <FormLabel>Třída</FormLabel>
                                <Select {...fieldProps}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {[...CLASSES].map((item) => (
                                            <SelectItem key={item} value={item}>
                                                {item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Třída, podle které se budou uživateli ukazovat nadcházející Akce.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
                <FormField
                    control={form.control}
                    name="role"
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
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                    <Select {...fieldProps}>
                                        <SelectTrigger>
                                            <SelectValue>{field.value === "admin" ? "Admin" : "Uživatel"}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="user">Uživatel</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />

                <FormField
                    control={form.control}
                    name="suspended"
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
                                    <FormLabel>Blokovat Uživatele</FormLabel>
                                </div>
                                <FormDescription>
                                    Blokování uživatele mu znemožní přihlášení na Akce a zobrazí mu hlášku o blokování,
                                    když se bude snažit přihlásit.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />

                <div className="flex justify-between space-x-4">
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogContent className="max-h-[90%] overflow-y-scroll max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Smazat uživatele</DialogTitle>
                            </DialogHeader>
                            <p>
                                Opravdu chcete smazat uživatele <code>{user.fullName}</code>? Tato akce je nevratná a
                                vymaže všechna data o přihlášeních na minulé i budoucí Akce. Uživatel se bude moci znovu
                                přihlásit pod stejným e-mailem a vytvořit si tím nový účet.
                            </p>
                            <div className="flex gap-3">
                                <Button onClick={() => setIsDeleteDialogOpen(false)}>Zrušit</Button>
                                <Button variant="destructive" disabled={isLoading} onClick={onDelete}>
                                    Smazat
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button
                        type="button"
                        className="flex gap-1"
                        variant="destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash size={16} /> Odstranit Uživatele
                    </Button>
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
