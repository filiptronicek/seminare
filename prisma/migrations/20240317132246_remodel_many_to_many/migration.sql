/*
  Warnings:

  - You are about to drop the `StudentOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StudentOption" DROP CONSTRAINT "StudentOption_optionId_fkey";

-- DropForeignKey
ALTER TABLE "StudentOption" DROP CONSTRAINT "StudentOption_studentId_fkey";

-- DropTable
DROP TABLE "StudentOption";

-- CreateTable
CREATE TABLE "_StudentOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_StudentOptions_AB_unique" ON "_StudentOptions"("A", "B");

-- CreateIndex
CREATE INDEX "_StudentOptions_B_index" ON "_StudentOptions"("B");

-- AddForeignKey
ALTER TABLE "_StudentOptions" ADD CONSTRAINT "_StudentOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "SingleEventOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentOptions" ADD CONSTRAINT "_StudentOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
