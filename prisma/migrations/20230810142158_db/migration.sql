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
    "gymId" TEXT,
    "measuresId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Students_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teachers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Students_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gyms" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    "updatedAt" DATETIME NOT NULL,
    "gymId" TEXT,
    CONSTRAINT "Teachers_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gyms" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Gyms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
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
    "gymId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "expanded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notifications_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gyms" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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

-- CreateIndex
CREATE UNIQUE INDEX "Students_email_key" ON "Students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teachers_email_key" ON "Teachers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Gyms_email_key" ON "Gyms"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationCodes_email_key" ON "VerificationCodes"("email");
