"use client";
import { Button } from "@/components/ui/button";

import { type ColumnDef } from "@tanstack/react-table";

import { type Student } from "@prisma/client";
import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { EditUserDialog } from "./EditUserDialog";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    const { error, data: users, isLoading, refetch } = api.user.list.useQuery({});

    const columns = useMemo<ColumnDef<Student>[]>(
        () => [
            {
                accessorKey: "fullName",
                header: "Jméno",
                enableSorting: true,
                sortUndefined: -1,
                cell: (cell) => {
                    return (
                        <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={cell.row.original.avatar ?? undefined} alt="" />
                                <AvatarFallback>{cell.row.original.fullName}</AvatarFallback>
                            </Avatar>
                            <span className="capitalize">{cell.row.original.fullName}</span>
                        </div>
                    );
                },
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

    if (error || !users) {
        return `Naskytla se chyba v načítání dat: ${error.message}`;
    }

    return <DataTable columns={columns} data={users} />;
};
