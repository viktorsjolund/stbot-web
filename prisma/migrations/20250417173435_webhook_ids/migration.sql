/*
  Warnings:

  - A unique constraint covering the columns `[online_webhook_id]` on the table `ActiveUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[offline_webhook_id]` on the table `ActiveUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ActiveUser" ADD COLUMN     "offline_webhook_id" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "online_webhook_id" TEXT NOT NULL DEFAULT '0';

-- CreateIndex
CREATE UNIQUE INDEX "ActiveUser_online_webhook_id_key" ON "ActiveUser"("online_webhook_id");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveUser_offline_webhook_id_key" ON "ActiveUser"("offline_webhook_id");
