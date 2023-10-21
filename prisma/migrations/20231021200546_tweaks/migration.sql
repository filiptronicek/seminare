-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "class" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "singleEventOptionId" TEXT,
    CONSTRAINT "Student_singleEventOptionId_fkey" FOREIGN KEY ("singleEventOptionId") REFERENCES "SingleEventOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "allowMultipleSelections" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "SingleEventOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "maxParticipants" INTEGER DEFAULT 2147483647,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "SingleEventOption_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentEvent" (
    "studentId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    PRIMARY KEY ("studentId", "eventId"),
    CONSTRAINT "StudentEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeacherOption" (
    "teacherId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    PRIMARY KEY ("teacherId", "optionId"),
    CONSTRAINT "TeacherOption_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeacherOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "SingleEventOption" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_StudentEvents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_StudentEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_StudentEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_SingleEventOptionToTeacher" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_SingleEventOptionToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "SingleEventOption" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SingleEventOptionToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_StudentEvents_AB_unique" ON "_StudentEvents"("A", "B");

-- CreateIndex
CREATE INDEX "_StudentEvents_B_index" ON "_StudentEvents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SingleEventOptionToTeacher_AB_unique" ON "_SingleEventOptionToTeacher"("A", "B");

-- CreateIndex
CREATE INDEX "_SingleEventOptionToTeacher_B_index" ON "_SingleEventOptionToTeacher"("B");
