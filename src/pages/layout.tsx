import { AvatarDropdown } from "@/components/ui/AvatarDropdown";
import { NavigationBar } from "@/components/ui/NavigationBar";
import { ThemeProvider } from "@/components/ui/theme-provider";

import Head from "next/head";
import { useUser } from "~/utils/hooks";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { data: userData } = useUser();

    return (
        <>
            <Head>
                <title>MMP</title>
                <meta name="description" content="Aplikace na přihlašování" />
            </Head>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <main className="flex min-h-screen h-screen flex-1 flex-col space-y-8 p-8">
                    <header className="flex flex-row items-center justify-between">
                        {userData && (
                            <>
                                <NavigationBar />
                                <AvatarDropdown user={userData} />
                            </>
                        )}
                    </header>
                    {children}
                </main>
            </ThemeProvider>
        </>
    );
}
