/*
  Warnings:

  - You are about to drop the column `gymId` on the `Teachers` table. All the data in the column will be lost.
  - You are about to drop the column `gymId` on the `Notifications` table. All the data in the column will be lost.
  - You are about to drop the column `gymId` on the `Students` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Teachers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "birthdate" TEXT NOT NULL,
    "telephone" TEXT,
    "status" BOOLEAN NOT NULL,
    "picture" TEXT,
    "code" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Teachers" ("birthdate", "city", "code", "complement", "createdAt", "district", "email", "id", "name", "number", "password", "picture", "state", "status", "street", "telephone", "updatedAt") SELECT "birthdate", "city", "code", "complement", "createdAt", "district", "email", "id", "name", "number", "password", "picture", "state", "status", "street", "telephone", "updatedAt" FROM "Teachers";
DROP TABLE "Teachers";
ALTER TABLE "new_Teachers" RENAME TO "Teachers";
CREATE UNIQUE INDEX "Teachers_email_key" ON "Teachers"("email");
CREATE TABLE "new_Notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "expanded" BOOLEAN NOT NULL DEFAULT false,
    "studentsId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notifications_studentsId_fkey" FOREIGN KEY ("studentsId") REFERENCES "Students" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Notifications" ("content", "createdAt", "expanded", "id", "title", "updatedAt") SELECT "content", "createdAt", "expanded", "id", "title", "updatedAt" FROM "Notifications";
DROP TABLE "Notifications";
ALTER TABLE "new_Notifications" RENAME TO "Notifications";
CREATE TABLE "new_Students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "birthdate" TEXT NOT NULL,
    "telephone" TEXT,
    "status" BOOLEAN NOT NULL,
    "picture" TEXT,
    "code" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "teacherId" TEXT,
    "measuresId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Students_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teachers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Students" ("birthdate", "city", "code", "complement", "createdAt", "district", "email", "id", "measuresId", "name", "number", "password", "picture", "state", "status", "street", "teacherId", "telephone", "updatedAt") SELECT "birthdate", "city", "code", "complement", "createdAt", "district", "email", "id", "measuresId", "name", "number", "password", "picture", "state", "status", "street", "teacherId", "telephone", "updatedAt" FROM "Students";
DROP TABLE "Students";
ALTER TABLE "new_Students" RENAME TO "Students";
CREATE UNIQUE INDEX "Students_email_key" ON "Students"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
