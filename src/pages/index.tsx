/* eslint-disable @typescript-eslint/no-unsafe-call */
import { UserNav } from "@/components/ui/UserNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Head from "next/head";
import { useUser } from "~/utils/hooks";
import { getUserName } from "~/utils/user";

export default function Home() {
    const { data: userData } = useUser();

    return (
        <>
            <Head>
                <title>MMP</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {userData && <UserNav user={userData} />}
            <main className="flex min-h-screen flex-col items-center justify-center">
                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl">Pryč ze seminářů</CardTitle>
                            <CardDescription>Přihlašování do aplikace probíhá přes školní Google účet.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4"></CardContent>
                    </Card>
                    uživatel {userData && getUserName(userData)}
                    <pre>{JSON.stringify(userData, null, 2)}</pre>
                </div>
            </main>
        </>
    );
}
