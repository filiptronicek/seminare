import { eventRouter } from "~/server/api/routers/event";
import { eventOptionsRouter } from "~/server/api/routers/event-options";
import { createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/user";
import { auditLogsRouter } from "./routers/audit-logs";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    event: eventRouter,
    eventOptions: eventOptionsRouter,
    user: userRouter,
    auditLogs: auditLogsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
