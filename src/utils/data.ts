import type { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";

/**
 * Generates an Excel spreadsheet for a specified event, with each event option as a separate worksheet.
 * Each worksheet lists the attendees (students) of that event option, including their full names and class.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.eventId - The unique identifier of the event for which to generate the Excel workbook.
 * @param {PrismaClient} params.db - The PrismaClient instance for database access.
 * @returns {Promise<Buffer>} A Promise that resolves to a buffer containing the Excel workbook data.
 */
export const generateExcelForEvent = async ({
    eventId,
    db,
}: {
    eventId: string;
    db: PrismaClient;
}): Promise<ExcelJS.Buffer> => {
    const workbook = new ExcelJS.Workbook();

    const options = await db.singleEventOption.findMany({
        where: { eventId: eventId },
        include: {
            StudentOption: {
                include: {
                    student: true,
                },
            },
        },
    });

    // Process each event option
    options.forEach((option) => {
        const sheet = workbook.addWorksheet(option.title);

        sheet.columns = [
            { header: "Jméno", key: "fullName" },
            { header: "Třída", key: "class" },
        ];

        option.StudentOption.forEach((so) => {
            sheet.addRow({
                fullName: so.student.fullName,
                class: so.student.class,
            });
        });
    });

    return workbook.xlsx.writeBuffer();
};
