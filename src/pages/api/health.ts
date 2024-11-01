import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";

type ResponseData = {
    healthy: Record<string, boolean | Error>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    const auditLogCount = await db.auditLog.count().catch((e) => {
        console.error(`There was an error with the database: ${e}`);
        return e as Error;
    });

    if (typeof auditLogCount === "number") {
        try {
            await db.auditLog.create({
                data: {
                    action: "health-check",
                    actor: "system",
                    metadata: {},
                    timestamp: new Date(),
                },
            });
        } catch (e) { } // we have already logged the error, so we can ignore it here
    }

    res.status(200).json({
        healthy: {
            database: auditLogCount instanceof Error ? auditLogCount : true,
            app: true,
        },
    });
}
