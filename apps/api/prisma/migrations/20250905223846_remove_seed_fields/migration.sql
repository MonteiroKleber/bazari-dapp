/*
  Warnings:

  - You are about to drop the column `authTag` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `encryptedSeed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `salt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "authTag",
DROP COLUMN "encryptedSeed",
DROP COLUMN "iv",
DROP COLUMN "salt";
