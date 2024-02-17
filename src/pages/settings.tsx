import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useUser } from "~/utils/hooks";
import { getUserName } from "~/utils/user";
import { ClassForm } from "../@/components/user/ClassForm";

import * as z from "zod";

export const FormSchema = z.object({
    currentClass: z.string({
        required_error: "Třída musí být zvolena.",
    }),
});

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
