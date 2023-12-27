/*
  Warnings:

  - You are about to drop the `_SingleEventOptionToTeacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `singleEventOptionId` on the `Student` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "_SingleEventOptionToTeacher_B_index";

-- DropIndex
DROP INDEX "_SingleEventOptionToTeacher_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_SingleEventOptionToTeacher";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "class" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "avatar" TEXT
);
INSERT INTO "new_Student" ("avatar", "class", "fullName", "id") SELECT "avatar", "class", "fullName", "id" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
