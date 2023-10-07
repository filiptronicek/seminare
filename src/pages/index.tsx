/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Head from "next/head";
import { useUser } from "~/utils/hooks";
import { getUserName } from "~/utils/user";

export default function Home() {
    const supabase = createClientComponentClient();
    const { data: userData } = useUser();

    const handleSignOut = () => {
        supabase.auth.signOut({}).catch((error) => {
            console.log(error);
        });
    };

    return (
        <>
            <Head>
                <title>MMP</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex min-h-screen flex-col items-center justify-center">
                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl">Pryč ze seminářů</CardTitle>
                            <CardDescription>Přihlašování do aplikace probíhá přes školní Google účet.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4"></CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleSignOut}>
                                Odhlásit se
                            </Button>
                        </CardFooter>
                    </Card>
                    uživatel {userData && getUserName(userData)}
                    <pre>{JSON.stringify(userData, null, 2)}</pre>
                </div>
            </main>
        </>
    );
}
