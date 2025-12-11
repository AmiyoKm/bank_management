/*
  Warnings:

  - Added the required column `disbursementAccountId` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "disbursementAccountId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_disbursementAccountId_fkey" FOREIGN KEY ("disbursementAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
