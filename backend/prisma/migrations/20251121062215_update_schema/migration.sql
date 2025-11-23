/*
  Warnings:

  - You are about to drop the column `uuid` on the `BotRule` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `WATemplate` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `WhatsAppAccount` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BotRule_uuid_key";

-- DropIndex
DROP INDEX "Contact_uuid_key";

-- DropIndex
DROP INDEX "Conversation_uuid_key";

-- DropIndex
DROP INDEX "Media_uuid_key";

-- DropIndex
DROP INDEX "Message_uuid_key";

-- DropIndex
DROP INDEX "WATemplate_uuid_key";

-- DropIndex
DROP INDEX "WebhookEvent_uuid_key";

-- DropIndex
DROP INDEX "WhatsAppAccount_uuid_key";

-- AlterTable
ALTER TABLE "BotRule" DROP COLUMN "uuid";

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "uuid";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "uuid";

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "uuid";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "uuid";

-- AlterTable
ALTER TABLE "WATemplate" DROP COLUMN "uuid";

-- AlterTable
ALTER TABLE "WebhookEvent" DROP COLUMN "uuid";

-- AlterTable
ALTER TABLE "WhatsAppAccount" DROP COLUMN "uuid";
