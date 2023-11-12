import { eventRouter } from "~/server/api/routers/events";
import { singleEventRouter } from "~/server/api/routers/single-event";
import { createTRPCRouter } from "~/server/api/trpc";
import { userSettingsRouter } from "./routers/user-settings";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    events: eventRouter,
    singleEvent: singleEventRouter,
    userSettings: userSettingsRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
