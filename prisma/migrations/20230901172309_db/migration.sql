/*
  Warnings:

  - You are about to alter the column `lifeStyle` on the `MedicalHistory` table. The data in that column could be lost. The data in that column will be cast from `String` to `Boolean`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MedicalHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentsId" TEXT NOT NULL,
    "surgicalHistory" BOOLEAN NOT NULL,
    "oncologicalHistory" BOOLEAN NOT NULL,
    "hypertension" BOOLEAN NOT NULL,
    "hypotension" BOOLEAN NOT NULL,
    "diabetes" BOOLEAN NOT NULL,
    "epilepsy" BOOLEAN NOT NULL,
    "smoker" BOOLEAN NOT NULL,
    "drinker" BOOLEAN NOT NULL,
    "stressTest" BOOLEAN NOT NULL,
    "sleepHours" INTEGER NOT NULL,
    "lifeStyle" BOOLEAN NOT NULL,
    "timeWithoutTraining" INTEGER NOT NULL,
    "heartProblem" BOOLEAN NOT NULL,
    "chestPain" BOOLEAN NOT NULL,
    "chestPainLastMonth" BOOLEAN NOT NULL,
    "imbalance" BOOLEAN NOT NULL,
    "boneJointIssue" BOOLEAN NOT NULL,
    "medication" BOOLEAN NOT NULL,
    "reasonForNotExercising" TEXT NOT NULL,
    "neckPain" BOOLEAN NOT NULL,
    "shoulderPain" BOOLEAN NOT NULL,
    "backPain" BOOLEAN NOT NULL,
    "wristPain" BOOLEAN NOT NULL,
    "fingerPain" BOOLEAN NOT NULL,
    "hipPain" BOOLEAN NOT NULL,
    "kneePain" BOOLEAN NOT NULL,
    "filled" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MedicalHistory_studentsId_fkey" FOREIGN KEY ("studentsId") REFERENCES "Students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MedicalHistory" ("backPain", "boneJointIssue", "chestPain", "chestPainLastMonth", "diabetes", "drinker", "epilepsy", "fingerPain", "heartProblem", "hipPain", "hypertension", "hypotension", "id", "imbalance", "kneePain", "lifeStyle", "medication", "neckPain", "oncologicalHistory", "reasonForNotExercising", "shoulderPain", "sleepHours", "smoker", "stressTest", "studentsId", "surgicalHistory", "timeWithoutTraining", "wristPain") SELECT "backPain", "boneJointIssue", "chestPain", "chestPainLastMonth", "diabetes", "drinker", "epilepsy", "fingerPain", "heartProblem", "hipPain", "hypertension", "hypotension", "id", "imbalance", "kneePain", "lifeStyle", "medication", "neckPain", "oncologicalHistory", "reasonForNotExercising", "shoulderPain", "sleepHours", "smoker", "stressTest", "studentsId", "surgicalHistory", "timeWithoutTraining", "wristPain" FROM "MedicalHistory";
DROP TABLE "MedicalHistory";
ALTER TABLE "new_MedicalHistory" RENAME TO "MedicalHistory";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
