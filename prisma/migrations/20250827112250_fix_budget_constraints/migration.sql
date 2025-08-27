/*
  Warnings:

  - A unique constraint covering the columns `[categoryId,month]` on the table `Budget` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Budget_categoryId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Budget_categoryId_month_key" ON "public"."Budget"("categoryId", "month");
