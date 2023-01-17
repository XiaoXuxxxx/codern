/*
  Warnings:

  - You are about to drop the column `profileUrl` on the `User` table. All the data in the column will be lost.
  - Added the required column `profilePath` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `profileUrl`,
    ADD COLUMN `profilePath` VARCHAR(191) NOT NULL;