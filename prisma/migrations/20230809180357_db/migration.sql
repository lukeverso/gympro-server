-- CreateTable
CREATE TABLE "ConfirmationCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "confirmationCode" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmationCode_email_key" ON "ConfirmationCode"("email");
