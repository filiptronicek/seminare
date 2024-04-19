// usage: bun run prisma/scripts/reset-classes.ts
// Resets all classes of all users, who are not admins to null.

import { db } from "../../src/server/db";

await db.student
    .updateMany({
        where: {
            admin: false,
        },
        data: {
            class: null,
        },
    })
    .then((a) => {
        console.log(a.count);
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
