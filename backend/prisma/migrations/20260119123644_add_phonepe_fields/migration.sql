/*
  Warnings:

  - You are about to drop the column `razorpayOrderId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `razorpayPaymentId` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "razorpayOrderId",
DROP COLUMN "razorpayPaymentId",
ADD COLUMN     "phonepePaymentId" TEXT,
ADD COLUMN     "phonepeTransactionId" TEXT;
