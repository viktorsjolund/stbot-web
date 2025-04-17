-- DropIndex
DROP INDEX "ActiveUser_offline_webhook_id_key";

-- DropIndex
DROP INDEX "ActiveUser_online_webhook_id_key";

-- AlterTable
ALTER TABLE "ActiveUser" ALTER COLUMN "offline_webhook_id" DROP NOT NULL,
ALTER COLUMN "offline_webhook_id" DROP DEFAULT,
ALTER COLUMN "online_webhook_id" DROP NOT NULL,
ALTER COLUMN "online_webhook_id" DROP DEFAULT;
