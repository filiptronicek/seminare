import { UserNav } from "@/components/ui/UserNav";

import { useUser } from "~/utils/hooks";
import Head from "next/head";
import { ThemeProvider } from "@/components/ui/theme-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { data: userData } = useUser();

    return (
        <>
            <Head>
                <title>MMP</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <main className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
                    <header className="flex items-center justify-end space-y-2">
                        {userData && <UserNav user={userData} />}
                    </header>
                    {children}
                </main>
            </ThemeProvider>
        </>
    );
}
