"use client";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type FilterFn,
    getFilteredRowModel,
    type SortingState,
    type ColumnSort,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

import { rankItem } from "@tanstack/match-sorter-utils";
import { Input } from "./input";

function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 200,
    ...props
}: {
    value: string;
    onChange: (value: string) => void;
    debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value);
        }, debounce);

        return () => clearTimeout(timeout);
    }, [debounce, onChange, value]);

    return <Input {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
}

export interface Props<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    className?: string;
    defaultSort?: ColumnSort;
    isLoading?: boolean;
    manualGlobalFilter?: string;
    setManualGlobalFilter?: (value: string) => void;
}
export function DataTable<TData, TValue>({
    columns,
    data,
    className,
    defaultSort,
    isLoading,
    manualGlobalFilter,
    setManualGlobalFilter,
}: Props<TData, TValue>) {
    const [globalFilterLocal, setGlobalFilterLocal] = useState("");
    const [sorting, setSorting] = useState<SortingState>(defaultSort ? [defaultSort] : []);

    const actualGlobalFilter = manualGlobalFilter ?? globalFilterLocal;
    const setActualGlobalFilter = setManualGlobalFilter ?? setGlobalFilterLocal;

    const fuzzyFilter: FilterFn<TData> = useCallback((row, columnId, value, addMeta) => {
        // Rank the item
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
        const itemRank = rankItem(row.getValue(columnId), value);

        // Store the itemRank info
        addMeta({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            itemRank,
        });

        // Return if the item should be filtered in/out
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return itemRank.passed;
    }, []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: manualGlobalFilter === undefined ? getFilteredRowModel() : undefined,
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        filterFns: {
            fuzzyFilter,
        },
        state: {
            globalFilter: actualGlobalFilter,
            sorting,
        },
        manualFiltering: manualGlobalFilter !== undefined,
        onGlobalFilterChange: setActualGlobalFilter,
        globalFilterFn: fuzzyFilter,
    });

    return (
        <div className={cn("rounded-md border dark:border-gray-600 w-full", className)}>
            <DebouncedInput
                value={actualGlobalFilter ?? ""}
                type="text"
                onChange={setActualGlobalFilter}
                className="p-2 font-lg"
                placeholder="Vyhledat"
            />
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className={cn({ "cursor-pointer": header.column.getCanSort() })}
                                    >
                                        <span className="flex items-center gap-1">
                                            {header.isPlaceholder ? null : (
                                                flexRender(header.column.columnDef.header, header.getContext())
                                            )}
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
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {isLoading && <Loader2 className="mt-2 ml-2 animate-spin" />}
                    {table.getRowModel().rows?.length ?
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    :   <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                Žádné výsledky
                            </TableCell>
                        </TableRow>
                    }
                </TableBody>
            </Table>
        </div>
    );
}
