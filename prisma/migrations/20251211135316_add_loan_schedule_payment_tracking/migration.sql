/*
  Warnings:

  - Added the required column `paidAt` to the `LoanSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LoanSchedule" ADD COLUMN     "paidAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "paidAt" TIMESTAMP(3) NOT NULL;
