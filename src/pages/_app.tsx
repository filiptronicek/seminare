import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type AppType } from "next/app";

const errorWithHttpStatusSchema = z.object({
    code: z.number(),
    data: z.object({
        httpStatus: z.number(),
        message: z.string(),
        code: z.string(),
        stack: z.string().optional(),
    })
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
                if (error instanceof TRPCClientError) {
                    const errorData = errorWithHttpStatusSchema.safeParse(error.shape);
                    if (!errorData.success) return false;

                    // On 4xx errors, don't retry
                    if (errorData.data.data.httpStatus >= 500) {
                        if (failureCount < 3) {
                            return true;
                        }
                    }
                    return false;
                }

                return false;
            },
        },
    },
});
import { Toaster } from "@/components/ui/toaster";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Layout from "./layout";
import { TRPCClientError } from "@trpc/client";
import { z } from "zod";

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
