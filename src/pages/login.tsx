import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AuthError } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUser } from "~/utils/hooks";

export default function Login() {
    const { data: userData, isLoading } = useUser();
    const supabase = createClientComponentClient();
    const router = useRouter();
    const search = useSearchParams();

    const handleSignIn = () => {
        supabase.auth
            .signInWithOAuth({
                provider: "google",
            })
            .catch((error) => {
                if (error instanceof AuthError) console.log(error.cause);
            });
    };

    useEffect(() => {
        if (userData) {
            void router.push("/");
        }
    }, [router, userData]);

    useEffect(() => {
        if (!search) return;
        if (search.get("error") === "server_error") {
            toast({
                title: "Chyba přihlášení",
                description:
                    "Nastala chyba při přihlašování, zkuste to prosím znovu. Účet musí být pod školní doménou.",
            });
        }
    }, [search]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="size-8 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>MMP</title>
                <meta name="description" content="Aplikace na přihlašování" />
            </Head>
            <main className="flex h-full flex-col items-center justify-center">
                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl">Pokračovat do seminářů</CardTitle>
                            <CardDescription>Přihlašování do aplikace probíhá přes školní Google účet.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4" />
                        <CardFooter>
                            <Button className="w-full" onClick={handleSignIn}>
                                Přihlásit se
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </>
    );
}
