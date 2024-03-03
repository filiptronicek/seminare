import { eventRouter } from "~/server/api/routers/events";
import { eventOptionsRouter } from "~/server/api/routers/event-options";
import { createTRPCRouter } from "~/server/api/trpc";
import { userSettingsRouter } from "./routers/user-settings";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    events: eventRouter,
    eventOptions: eventOptionsRouter,
    userSettings: userSettingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
