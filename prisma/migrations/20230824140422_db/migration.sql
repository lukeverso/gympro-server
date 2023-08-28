-- CreateTable
CREATE TABLE "_NotificationsToStudents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_NotificationsToStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "Notifications" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_NotificationsToStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "Students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "expanded" BOOLEAN NOT NULL DEFAULT false,
    "studentsId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Notifications" ("content", "createdAt", "expanded", "id", "studentsId", "title", "updatedAt") SELECT "content", "createdAt", "expanded", "id", "studentsId", "title", "updatedAt" FROM "Notifications";
DROP TABLE "Notifications";
ALTER TABLE "new_Notifications" RENAME TO "Notifications";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_NotificationsToStudents_AB_unique" ON "_NotificationsToStudents"("A", "B");

-- CreateIndex
CREATE INDEX "_NotificationsToStudents_B_index" ON "_NotificationsToStudents"("B");
