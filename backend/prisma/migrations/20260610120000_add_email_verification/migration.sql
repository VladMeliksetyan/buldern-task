-- AlterTable
ALTER TABLE `users` ADD COLUMN `email_verified` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `verification_token` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_verification_token_key` ON `users`(`verification_token`);
