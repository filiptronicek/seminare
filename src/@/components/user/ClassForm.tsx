import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { api } from "~/utils/api";
import { FormSchema } from "../../../pages/settings";
import { CLASSES } from "~/utils/constants";

export const ClassForm = () => {
    const updateMutation = api.user.changeClass.useMutation();
    const {
        data: student,
        isLoading: isStudentLoading,
        isError: isStudentError,
        refetch,
    } = api.user.get.useQuery();
    const utils = api.useContext();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        updateMutation.mutate(
            { class: data.currentClass },
            {
                onSuccess: () => {
                    void utils.user.getStudent.invalidate();

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
                                    {[...CLASSES].map((item) => (
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
