-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateTable
CREATE TABLE "WhatsAppAccount" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "phoneNumberId" TEXT,
    "businessAccountId" TEXT,
    "displayName" TEXT,
    "accessToken" TEXT NOT NULL,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "webhookUrl" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "waAccountId" INTEGER NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "profilePicUrl" TEXT,
    "lastMessage" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "waAccountId" INTEGER NOT NULL,
    "contactId" INTEGER NOT NULL,
    "conversationId" INTEGER,
    "direction" "MessageDirection" NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "messageType" TEXT NOT NULL,
    "text" TEXT,
    "mediaId" INTEGER,
    "waMessageId" TEXT,
    "timestamp" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "waAccountId" INTEGER NOT NULL,
    "contactId" INTEGER NOT NULL,
    "lastMessage" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "waAccountId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "url" TEXT NOT NULL,
    "waMediaId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "waAccountId" INTEGER NOT NULL,
    "eventType" TEXT,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotRule" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "waAccountId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "keyword" TEXT,
    "replyText" TEXT,
    "replyMediaId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WATemplate" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "waAccountId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "components" JSONB NOT NULL,
    "example" JSONB,
    "reason" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WATemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAccount_uuid_key" ON "WhatsAppAccount"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_uuid_key" ON "Contact"("uuid");

-- CreateIndex
CREATE INDEX "Contact_waAccountId_idx" ON "Contact"("waAccountId");

-- CreateIndex
CREATE INDEX "Contact_phone_idx" ON "Contact"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_waAccountId_phone_key" ON "Contact"("waAccountId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Message_uuid_key" ON "Message"("uuid");

-- CreateIndex
CREATE INDEX "Message_waAccountId_idx" ON "Message"("waAccountId");

-- CreateIndex
CREATE INDEX "Message_contactId_idx" ON "Message"("contactId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_status_idx" ON "Message"("status");

-- CreateIndex
CREATE INDEX "Message_waMessageId_idx" ON "Message"("waMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_uuid_key" ON "Conversation"("uuid");

-- CreateIndex
CREATE INDEX "Conversation_waAccountId_idx" ON "Conversation"("waAccountId");

-- CreateIndex
CREATE INDEX "Conversation_contactId_idx" ON "Conversation"("contactId");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_waAccountId_contactId_key" ON "Conversation"("waAccountId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_uuid_key" ON "Media"("uuid");

-- CreateIndex
CREATE INDEX "Media_waAccountId_idx" ON "Media"("waAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_uuid_key" ON "WebhookEvent"("uuid");

-- CreateIndex
CREATE INDEX "WebhookEvent_waAccountId_idx" ON "WebhookEvent"("waAccountId");

-- CreateIndex
CREATE INDEX "WebhookEvent_eventType_idx" ON "WebhookEvent"("eventType");

-- CreateIndex
CREATE INDEX "WebhookEvent_processed_idx" ON "WebhookEvent"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "BotRule_uuid_key" ON "BotRule"("uuid");

-- CreateIndex
CREATE INDEX "BotRule_waAccountId_idx" ON "BotRule"("waAccountId");

-- CreateIndex
CREATE INDEX "BotRule_triggerType_idx" ON "BotRule"("triggerType");

-- CreateIndex
CREATE INDEX "BotRule_keyword_idx" ON "BotRule"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "WATemplate_uuid_key" ON "WATemplate"("uuid");

-- CreateIndex
CREATE INDEX "WATemplate_status_idx" ON "WATemplate"("status");

-- CreateIndex
CREATE INDEX "WATemplate_category_idx" ON "WATemplate"("category");

-- CreateIndex
CREATE UNIQUE INDEX "WATemplate_waAccountId_name_key" ON "WATemplate"("waAccountId", "name");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_waAccountId_fkey" FOREIGN KEY ("waAccountId") REFERENCES "WhatsAppAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_waAccountId_fkey" FOREIGN KEY ("waAccountId") REFERENCES "WhatsAppAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_waAccountId_fkey" FOREIGN KEY ("waAccountId") REFERENCES "WhatsAppAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_waAccountId_fkey" FOREIGN KEY ("waAccountId") REFERENCES "WhatsAppAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_waAccountId_fkey" FOREIGN KEY ("waAccountId") REFERENCES "WhatsAppAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotRule" ADD CONSTRAINT "BotRule_waAccountId_fkey" FOREIGN KEY ("waAccountId") REFERENCES "WhatsAppAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotRule" ADD CONSTRAINT "BotRule_replyMediaId_fkey" FOREIGN KEY ("replyMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WATemplate" ADD CONSTRAINT "WATemplate_waAccountId_fkey" FOREIGN KEY ("waAccountId") REFERENCES "WhatsAppAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
