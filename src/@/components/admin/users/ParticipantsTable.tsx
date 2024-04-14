"use client";
import { Button } from "@/components/ui/button";

import { type ColumnDef } from "@tanstack/react-table";

import { type Student } from "@prisma/client";
import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { useMemo } from "react";

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

const ActionCell = ({ row, refetch }: { row: { original: Student }; refetch: () => void }) => {
    return (
        <>
            <Button
                type="button"
                variant={"secondary"}
                onClick={() => {
                    // todo: implement leave mutation for a given user id
                    //leaveMutation.mutate({ optionId: row.original.id });
                    refetch();
                }}
                disabled
            >
                Odhlásit
            </Button>
        </>
    );
};

export const OptionParticipantsTable = ({optionId}: {optionId: string}) => {
    const { error, data: users, isLoading, refetch } = api.eventOptions.listOptionParticipants.useQuery({optionId});

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
