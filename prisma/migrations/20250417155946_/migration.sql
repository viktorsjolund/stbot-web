/*
  Warnings:

  - You are about to drop the column `broadcaster_id` on the `ActiveUser` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ActiveUser_broadcaster_id_key";

-- AlterTable
ALTER TABLE "ActiveUser" DROP COLUMN "broadcaster_id";
