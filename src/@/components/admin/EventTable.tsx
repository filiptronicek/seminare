"use client";
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { type ColumnDef } from "@tanstack/react-table";

import { type Event } from "@prisma/client";
import { formatDate } from "~/utils/dates";
import dayjs from "dayjs";
import { api } from "~/utils/api";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
        accessorKey: "type",
        header: "Typ",
        enableSorting: false,
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
];

export function EventsDataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className={cn("", { "cursor-pointer": header.column.getCanSort() })}
                                    >
                                        <span className="flex items-center gap-1">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                            {
                                                {
                                                    asc: <ChevronUp size={20} />,
                                                    desc: <ChevronDown size={20} />,
                                                    false: <div className="w-5" />,
                                                }[header.column.getIsSorted() as string]
                                            }
                                        </span>
                                    </TableHead>
                                );
                            })}
                            {/* For the view button */}
                            <TableHead />
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                                <TableCell>
                                    <Button type="button" variant={"secondary"}>
                                        Zobrazit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export const EventTable = () => {
    const { isError, data: events, isLoading } = api.events.listEvents.useQuery({});

    if (isLoading) {
        return <Loader2 className="animate-spin" />;
    }

    if (isError || !events) {
        return "Naskytla se chyba v načítání dat";
    }

    return <EventsDataTable columns={columns} data={events} />;
};
