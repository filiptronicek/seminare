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
import { CLASSES, Class } from "~/utils/constants";
import { singleUserSchema } from "~/utils/schemas";

export const ClassForm = () => {
    const updateMutation = api.user.update.useMutation();
    const {
        data: student,
        isLoading: isStudentLoading,
        isError: isStudentError,
        refetch,
    } = api.user.get.useQuery();
    const utils = api.useContext();

    const form = useForm<z.infer<typeof singleUserSchema>>({
        resolver: zodResolver(singleUserSchema),
    });

    const onSubmit = (values: z.infer<typeof singleUserSchema>) => {
        updateMutation.mutate(
            { data: { class: values.class }},
            {
                onSuccess: () => {
                    void utils.user.get.invalidate();

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
                    name="class"
                    defaultValue={student?.class as Class}
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
