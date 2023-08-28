/*
  Warnings:

  - Added the required column `teachersId` to the `Notifications` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "expanded" BOOLEAN NOT NULL DEFAULT false,
    "teachersId" TEXT NOT NULL,
    "studentsId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notifications_teachersId_fkey" FOREIGN KEY ("teachersId") REFERENCES "Teachers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Notifications" ("content", "createdAt", "expanded", "id", "studentsId", "title", "updatedAt") SELECT "content", "createdAt", "expanded", "id", "studentsId", "title", "updatedAt" FROM "Notifications";
DROP TABLE "Notifications";
ALTER TABLE "new_Notifications" RENAME TO "Notifications";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
