"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { type ColumnDef } from "@tanstack/react-table";

import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";
import { DataTable } from "../ui/DataTable";
import { useMemo, useState } from "react";

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export const AuditLogsTable = () => {
    const { isError, data: events, isLoading } = api.auditLogs.list.useQuery({});
    const [selectedLog, setSelectedLog] = useState<string | null>(null);

    const columns = useMemo<ColumnDef<{ id: string; action: string; timestamp: Date; actor: { name: string; id: string} }>[]>(() => {
        return [
            {
                accessorKey: "action",
                header: "Název",
                enableSorting: false,
            },
            {
                header: "Uživatel",
                accessorKey: "actor.name",
                enableSorting: false,
            },
            {
                header: "Čas",
                accessorKey: "timestamp",
                enableSorting: false,
                accessorFn: (row) => row.timestamp.toLocaleString(),
            },
            {
                id: "actions",
                cell: (cell) => (
                    <Button type="button" onClick={() => setSelectedLog(cell.row.original.id)} variant={"secondary"}>
                        Detail
                    </Button>
                ),
            },
        ];
    }, []);

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (isError || !events) {
        return "Naskytla se chyba v načítání dat";
    }

    return (
        <>
            <DataTable columns={columns} data={events} />
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-h-[90%] overflow-y-scroll max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Audit log detail</DialogTitle>
                        {selectedLog && <AuditLogDetail id={selectedLog} />}
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const AuditLogDetail = ({ id }: { id: string }) => {
    const { isError, data: logDetails, isLoading } = api.auditLogs.get.useQuery({ id });

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (isError || !logDetails) {
        return "Naskytla se chyba v načítání dat";
    }

    return (
        <div className="flex flex-col gap-2">
            <h2>Action: {logDetails.action}</h2>
            <p>Actor: {logDetails.actor.name} ({logDetails.actor.id})</p>
            <p>Time: {logDetails.timestamp.toLocaleString()}</p>
            Payload: <pre>{JSON.stringify(logDetails.metadata, null, 2)}</pre>
        </div>
    );
};
