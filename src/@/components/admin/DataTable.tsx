"use client";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { type ColumnDef } from "@tanstack/react-table";

import { type Event } from "@prisma/client";
import { formatDate } from "~/utils/dates";
import dayjs from "dayjs";
import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export const columns: ColumnDef<Event>[] = [
    {
        accessorKey: "title",
        header: "Název",
    },
    {
        accessorKey: "type",
        header: "Typ",
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
    },
    {
        accessorFn: (row) => row.visibleToClasses.join(", "),
        header: "Třídy",
    },
    {
        accessorFn: (row) => row.visibleToClasses.join(", "),
        header: "Třídy",
    },
];

export function EventsDataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                );
                            })}
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
}
