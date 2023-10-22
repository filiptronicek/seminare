/*
  Warnings:

  - You are about to drop the `StudentEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StudentEvent";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "StudentOption" (
    "studentId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    PRIMARY KEY ("studentId", "optionId"),
    CONSTRAINT "StudentOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "SingleEventOption" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentOption_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
