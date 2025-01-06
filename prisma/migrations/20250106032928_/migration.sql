-- CreateTable
CREATE TABLE "SkipUser" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "SkipUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkipUser_user_id_key" ON "SkipUser"("user_id");
