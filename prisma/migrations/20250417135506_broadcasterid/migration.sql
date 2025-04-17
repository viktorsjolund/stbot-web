/*
  Warnings:

  - A unique constraint covering the columns `[broadcaster_id]` on the table `ActiveUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `broadcaster_id` to the `ActiveUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActiveUser" ADD COLUMN     "broadcaster_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ActiveUser_broadcaster_id_key" ON "ActiveUser"("broadcaster_id");
