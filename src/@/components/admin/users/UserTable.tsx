"use client";
import { Button } from "@/components/ui/button";

import { type ColumnDef } from "@tanstack/react-table";

import { type Student } from "@prisma/client";
import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { EditUserDialog } from "./EditUserDialog";
import { useMemo, useState } from "react";

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

const ActionCell = ({ row, refetch }: { row: { original: Student }; refetch: () => void }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
            <EditUserDialog refetch={refetch} user={row.original} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
            <Button
                type="button"
                variant={"secondary"}
                onClick={() => {
                    setIsDialogOpen(true);
                }}
            >
                Upravit
            </Button>
        </>
    );
};

export const UserTable = () => {
    const { isError, data: users, isLoading, refetch } = api.user.list.useQuery();

    const columns = useMemo<ColumnDef<Student>[]>(
        () => [
            {
                accessorKey: "fullName",
                header: "Jméno",
                enableSorting: true,
                sortUndefined: -1,
            },
            {
                header: "Třída",
                accessorKey: "class",
            },
            {
                header: "Role",
                accessorFn(row) {
                    return row.admin ? "Admin" : "Uživatel";
                },
            },
            {
                id: "actions",
                cell: (cell) => {
                    return <ActionCell refetch={refetch} row={cell.row} />;
                },
            },
        ],
        [refetch],
    );

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (isError || !users) {
        return "Naskytla se chyba v načítání dat";
    }

    return <DataTable columns={columns} data={users} />;
};
