"use client";
import { Button } from "@/components/ui/button";

import { type ColumnDef } from "@tanstack/react-table";

import { type SingleEventOption } from "@prisma/client";
import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";
import { DataTable } from "../ui/DataTable";
import { useCallback, useMemo } from "react";

type Props = {
    id: string;
};
export const EventOptionTable = ({ id }: Props) => {
    const { isError, data, isLoading, refetch } = api.eventOptions.list.useQuery({ id });
    const utils = api.useContext();
    const deleteOption = api.eventOptions.delete.useMutation();

    const handleDelete = useCallback(
        (id: string) => {
            deleteOption.mutate(
                { optionId: id },
                {
                    onSuccess: () => {
                        void utils.eventOptions.list.invalidate({ id });
                        void refetch();
                    },
                },
            );
        },
        [deleteOption, refetch, utils.eventOptions.list],
    );

    const columns = useMemo<ColumnDef<SingleEventOption>[]>(
        () => [
            {
                accessorKey: "title",
                header: "Název",
                enableSorting: true,
                sortUndefined: -1,
            },
            {
                header: "Kapacita",
                accessorFn: (row) => {
                    return row.maxParticipants ?? "∞";
                },
            },
            {
                id: "actions",
                header: "Akce",
                cell: (cell) => (
                    <Button type="button" variant={"destructive"} onClick={() => handleDelete(cell.row.original.id)}>
                        Vymazat
                    </Button>
                ),
            },
        ],
        [handleDelete],
    );

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (isError || !data) {
        return "Naskytla se chyba v načítání dat";
    }

    return <DataTable className="max-w-2xl" columns={columns} data={data} />;
};
