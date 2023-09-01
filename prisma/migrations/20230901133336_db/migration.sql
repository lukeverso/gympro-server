-- CreateTable
CREATE TABLE "Students" (
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

-- CreateTable
CREATE TABLE "Teachers" (
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

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "expanded" BOOLEAN NOT NULL DEFAULT false,
    "teacherId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notifications_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teachers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Measures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentsId" TEXT,
    "height" TEXT,
    "weight" TEXT,
    "bmi" TEXT,
    "chest" TEXT,
    "wingspan" TEXT,
    "waist" TEXT,
    "hip" TEXT,
    "arm" TEXT,
    "thigh" TEXT,
    "calf" TEXT,
    "shoulders" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Measures_studentsId_fkey" FOREIGN KEY ("studentsId") REFERENCES "Students" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sheets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentsId" TEXT NOT NULL,
    "annotations" TEXT,
    "objective" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Sheets_studentsId_fkey" FOREIGN KEY ("studentsId") REFERENCES "Students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Workouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sheetsId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "focus" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Workouts_sheetsId_fkey" FOREIGN KEY ("sheetsId") REFERENCES "Sheets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exercises" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workoutsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "repetitions" TEXT NOT NULL,
    "restTime" TEXT NOT NULL,
    "weight" TEXT,
    "annotations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Exercises_workoutsId_fkey" FOREIGN KEY ("workoutsId") REFERENCES "Workouts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationCodes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MedicalHistory" (
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
    "lifeStyle" TEXT NOT NULL,
    "timeWithoutTraining" INTEGER NOT NULL,
    "heartProblem" BOOLEAN NOT NULL,
    "chestPain" BOOLEAN NOT NULL,
    "chestPainLastMonth" BOOLEAN NOT NULL,
    "imbalance" BOOLEAN NOT NULL,
    "boneJointIssue" BOOLEAN NOT NULL,
    "medication" BOOLEAN NOT NULL,
    "reasonForNotExercising" BOOLEAN NOT NULL,
    "neckPain" BOOLEAN NOT NULL,
    "shoulderPain" BOOLEAN NOT NULL,
    "backPain" BOOLEAN NOT NULL,
    "wristPain" BOOLEAN NOT NULL,
    "fingerPain" BOOLEAN NOT NULL,
    "hipPain" BOOLEAN NOT NULL,
    "kneePain" BOOLEAN NOT NULL,
    CONSTRAINT "MedicalHistory_studentsId_fkey" FOREIGN KEY ("studentsId") REFERENCES "Students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_NotificationsToStudents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_NotificationsToStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "Notifications" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_NotificationsToStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "Students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Students_email_key" ON "Students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teachers_email_key" ON "Teachers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationCodes_email_key" ON "VerificationCodes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_NotificationsToStudents_AB_unique" ON "_NotificationsToStudents"("A", "B");

-- CreateIndex
CREATE INDEX "_NotificationsToStudents_B_index" ON "_NotificationsToStudents"("B");
