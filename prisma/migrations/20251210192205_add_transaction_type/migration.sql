-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'FIXED_DEPOSIT';
ALTER TYPE "TransactionType" ADD VALUE 'FIXED_DEPOSIT_WITHDRAWAL';
ALTER TYPE "TransactionType" ADD VALUE 'LOAN';
ALTER TYPE "TransactionType" ADD VALUE 'LOAN_PAYMENT';
ALTER TYPE "TransactionType" ADD VALUE 'LOAN_INTEREST';
