"use client";
import { Button } from "@/components/ui/button";

import { type ColumnDef } from "@tanstack/react-table";

import { type Student } from "@prisma/client";
import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { useMemo } from "react";
import { AddUserPopover } from "./AddUserPopover";

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

const ActionCell = ({
    row,
    optionId,
    refetch,
}: {
    row: { original: Student };
    optionId: string;
    refetch: () => void;
}) => {
    const leaveMutation = api.eventOptions.leaveUnconditionally.useMutation();

    return (
        <>
            <Button
                type="button"
                variant={"secondary"}
                onClick={() => {
                    leaveMutation.mutate({ optionId, userId: row.original.id }, { onSuccess: refetch });
                }}
            >
                Odhlásit
            </Button>
        </>
    );
};

type Props = {
    optionId: string;
};
export const OptionParticipantsTable = ({ optionId }: Props) => {
    const { error, data: users, isLoading, refetch } = api.eventOptions.listOptionParticipants.useQuery({ optionId });

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
                    return <ActionCell row={cell.row} optionId={optionId} refetch={refetch} />;
                },
            },
        ],
        [optionId, refetch],
    );

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (error || !users) {
        return `Naskytla se chyba v načítání dat: ${error.message}`;
    }

    return (
        <>
            <DataTable columns={columns} data={users} />
            <AddUserPopover optionId={optionId} refetch={refetch} />
        </>
    );
};
