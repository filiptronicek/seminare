-- DropForeignKey
ALTER TABLE "SingleEventOption" DROP CONSTRAINT "SingleEventOption_eventId_fkey";

-- AddForeignKey
ALTER TABLE "SingleEventOption" ADD CONSTRAINT "SingleEventOption_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
