"use client";
import { Button } from "@/components/ui/button";

import { type ColumnDef } from "@tanstack/react-table";

import { type Event } from "@prisma/client";
import { formatDate } from "~/utils/dates";
import dayjs from "dayjs";
import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { DataTable } from "../ui/DataTable";
import { displayEventType } from "~/utils/display";
import { type EVENT_TYPE } from "~/utils/constants";

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

const compareDates = (a?: Date | null, b?: Date | null) => {
    if (a === b) {
        return 0;
    }
    if (!a) {
        return -1;
    }
    if (!b) {
        return 1;
    }
    return a.getTime() - b.getTime();
};

export const columns: ColumnDef<Event>[] = [
    {
        accessorKey: "title",
        header: "Název",
        enableSorting: true,
        sortUndefined: -1,
    },
    {
        header: "Typ",
        enableSorting: false,
        accessorFn: (row) => displayEventType(row.type as EVENT_TYPE),
    },
    {
        header: "Začátek přihlašování",
        accessorFn: (row) => {
            const { signupStartDate } = row;
            if (!signupStartDate) {
                return "";
            }

            return formatDate(dayjs(signupStartDate));
        },
        sortingFn: (a, b) => {
            const dateA = a.original.signupStartDate;
            const dateB = b.original.signupStartDate;

            return compareDates(dateA, dateB);
        },
    },
    {
        header: "Konec přihlašování",
        accessorFn: (row) => {
            const { signupEndDate } = row;
            if (!signupEndDate) {
                return "";
            }

            return formatDate(dayjs(signupEndDate));
        },
        sortingFn: (a, b) => {
            const dateA = a.original.signupEndDate;
            const dateB = b.original.signupEndDate;

            return compareDates(dateA, dateB);
        },
    },
    {
        accessorFn: (row) => row.visibleToClasses.join(", "),
        header: "Třídy",
        enableSorting: false,
    },
    {
        id: "actions",
        cell: (cell) => (
            <Button type="button" variant={"secondary"} asChild>
                <Link href={`/admin/events/${cell.row.original.id}`}>Zobrazit</Link>
            </Button>
        ),
    },
];

export const EventTable = () => {
    const { isError, data: events, isLoading } = api.events.list.useQuery({});

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (isError || !events) {
        return "Naskytla se chyba v načítání dat";
    }

    return <DataTable columns={columns} data={events} />;
};
