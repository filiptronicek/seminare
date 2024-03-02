"use client";
import { Button } from "@/components/ui/button";

import { type ColumnDef } from "@tanstack/react-table";

import { type SingleEventOption } from "@prisma/client";
import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";
import { DataTable } from "../ui/DataTable";

export const columns: ColumnDef<SingleEventOption>[] = [
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
            <Button type="button" variant={"destructive"}>
                Vymazat
            </Button>
        ),
    },
];

type Props = {
    id: string;
};
export const EventOptionTable = ({ id }: Props) => {
    const { isError, data, isLoading } = api.singleEvent.listOptions.useQuery({ id });

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (isError || !data) {
        return "Naskytla se chyba v načítání dat";
    }

    return <DataTable columns={columns} data={data} />;
};
