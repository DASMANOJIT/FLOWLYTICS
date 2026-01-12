/*
  Warnings:

  - A unique constraint covering the columns `[studentId,month,academicYear]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `academicYear` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `month` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `amount` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "academicYear" INTEGER NOT NULL,
ALTER COLUMN "month" SET NOT NULL,
ALTER COLUMN "amount" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_studentId_month_academicYear_key" ON "Payment"("studentId", "month", "academicYear");
