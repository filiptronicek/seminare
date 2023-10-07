import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type AppType } from "next/app";

const queryClient = new QueryClient();
import { Toaster } from "@/components/ui/toaster"

import { api } from "~/utils/api";

import "~/styles/globals.css";

const App: AppType = ({ Component, pageProps }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <Toaster />
            <Component {...pageProps} />
        </QueryClientProvider>
    );
};

export default api.withTRPC(App);
