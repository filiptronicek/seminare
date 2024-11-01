import { Loader2 } from "lucide-react";
import { api } from "~/utils/api";
import { AuditLogsTable } from "@/components/admin/AuditLogsTable";

export default function AuditLogs() {
    const { error, data: logs, isLoading } = api.auditLogs.list.useQuery({});

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (error || !logs) {
        return `Naskytla se chyba v načítání dat: ${error?.message}`;
    }

    return (
        <section className="flex min-h-screen flex-col items-start gap-8">
            <div className="flex items-center justify-between w-full">
                <h1 className="text-3xl font-bold">Audit Log</h1>
            </div>
            <AuditLogsTable />
        </section>
    );
}
