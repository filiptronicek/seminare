-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "class" TEXT,
    "fullName" TEXT NOT NULL,
    "avatar" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "allowMultipleSelections" BOOLEAN NOT NULL DEFAULT false,
    "signupEndDate" TIMESTAMP(3),
    "signupStartDate" TIMESTAMP(3),
    "visibleToClasses" TEXT[],
    "metadata" JSONB,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SingleEventOption" (
    "id" TEXT NOT NULL,
    "maxParticipants" INTEGER DEFAULT 2147483647,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventId" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "SingleEventOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentOption" (
    "studentId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "StudentOption_pkey" PRIMARY KEY ("studentId","optionId")
);

-- AddForeignKey
ALTER TABLE "SingleEventOption" ADD CONSTRAINT "SingleEventOption_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentOption" ADD CONSTRAINT "StudentOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "SingleEventOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentOption" ADD CONSTRAINT "StudentOption_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
