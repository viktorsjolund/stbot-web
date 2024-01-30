-- CreateTable
CREATE TABLE "ActiveUser" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "ActiveUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActiveUser_user_id_key" ON "ActiveUser"("user_id");

-- AddForeignKey
ALTER TABLE "ActiveUser" ADD CONSTRAINT "ActiveUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
