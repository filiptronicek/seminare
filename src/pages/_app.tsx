import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type AppType } from "next/app";

const queryClient = new QueryClient();
import { Toaster } from "@/components/ui/toaster";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Layout from "./layout";

const App: AppType = ({ Component, pageProps }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <Toaster />
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </QueryClientProvider>
    );
};

export default api.withTRPC(App);
