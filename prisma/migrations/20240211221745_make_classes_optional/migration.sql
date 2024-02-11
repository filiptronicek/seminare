-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "class" TEXT,
    "fullName" TEXT NOT NULL,
    "avatar" TEXT
);
INSERT INTO "new_Student" ("avatar", "class", "fullName", "id") SELECT "avatar", "class", "fullName", "id" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
