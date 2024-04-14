"use client";
import { Button } from "@/components/ui/button";

import { type ColumnDef } from "@tanstack/react-table";

import { type Event, type SingleEventOption } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "~/utils/api";
import { EVENT_TYPE } from "~/utils/constants";
import { parseSeminarMetaSafe, parseSeminarOptionMetaSafe } from "~/utils/seminars";
import { DataTable } from "../ui/DataTable";
import { NewOptionDialog } from "./NewOptionDialog";
import Link from "next/link";

const ActionCell = ({
    row,
    event,
}: {
    row: { original: SingleEventOption };
    event: Event;
}) => {
    return (
        <>
            <Button type="button" variant={"secondary"} asChild>
                <Link href={`/admin/events/${event.id}/${row.original.id}`}>Zobrazit</Link>
            </Button>
        </>
    );
};

type Props = {
    event: Event;
};
export const EventOptionTable = ({ event }: Props) => {
    const { isError, data, isLoading, refetch } = api.eventOptions.list.useQuery({ id: event.id });
    const [showNewDialog, setShowNewDialog] = useState(false);

    const columns = useMemo<ColumnDef<SingleEventOption>[]>(() => {
        const cols: ColumnDef<SingleEventOption>[] = [
            {
                accessorKey: "title",
                header: "Název",
                enableSorting: true,
                sortUndefined: -1,
            },
            {
                header: "Kapacita",
                cell: (cell) => {
                    return <div>{cell.row.original.maxParticipants ?? "Neomezená"}</div>;
                },
                accessorKey: "maxParticipants",
            },
        ];

        if (event.type === EVENT_TYPE.SEMINAR.toString()) {
            cols.push({
                header: "Hodin týdně",
                accessorFn: (row) => {
                    const metadata = parseSeminarOptionMetaSafe(row.metadata);

                    return metadata?.hoursPerWeek;
                },
            });
            cols.push({
                header: "Větev",
                accessorFn: (row) => {
                    const metadata = parseSeminarOptionMetaSafe(row.metadata);

                    if (metadata) {
                        const eventMetadata = parseSeminarMetaSafe(event.metadata);
                        const displayName =
                            eventMetadata?.availableBranches.find((branch) => branch.id === metadata.branch)?.label ??
                            "Neznámá větev";

                        return displayName;
                    }
                },
            });
        }

        cols.push({
            id: "actions",
            cell: (cell) => {
                return <ActionCell row={cell.row} event={event} />;
            },
        });

        return cols;
    }, [event, refetch]);

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (isError || !data) {
        return "Naskytla se chyba v načítání dat";
    }

    return (
        <>
            <div className="flex justify-between my-4">
                <h2 className="text-2xl font-bold">Možnosti</h2>
                <Button variant="secondary" onClick={() => setShowNewDialog(true)}>
                    Přidat možnost
                </Button>
                <NewOptionDialog refetch={refetch} event={event} open={showNewDialog} onOpenChange={setShowNewDialog} />
            </div>
            <DataTable defaultSort={{ id: "title", desc: false }} className="max-w-3xl" columns={columns} data={data} />
        </>
    );
};
