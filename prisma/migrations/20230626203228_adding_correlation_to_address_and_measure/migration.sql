-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Measures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "height" TEXT,
    "weight" TEXT,
    "bmi" TEXT,
    "wingspan" TEXT,
    "waist" TEXT,
    "hip" TEXT,
    "arm" TEXT,
    "thigh" TEXT,
    "bodyFat" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Measures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Measures" ("arm", "bmi", "bodyFat", "createdAt", "height", "hip", "id", "thigh", "updatedAt", "userId", "waist", "weight", "wingspan") SELECT "arm", "bmi", "bodyFat", "createdAt", "height", "hip", "id", "thigh", "updatedAt", "userId", "waist", "weight", "wingspan" FROM "Measures";
DROP TABLE "Measures";
ALTER TABLE "new_Measures" RENAME TO "Measures";
CREATE TABLE "new_Address" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Address" ("city", "code", "complement", "country", "createdAt", "id", "number", "street", "updatedAt", "userId") SELECT "city", "code", "complement", "country", "createdAt", "id", "number", "street", "updatedAt", "userId" FROM "Address";
DROP TABLE "Address";
ALTER TABLE "new_Address" RENAME TO "Address";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
