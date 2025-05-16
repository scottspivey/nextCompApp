/*
  Warnings:

  - You are about to drop the column `body_parts_injured` on the `claims` table. All the data in the column will be lost.
  - You are about to drop the column `carrier_code` on the `claims` table. All the data in the column will be lost.
  - You are about to drop the column `employer_address` on the `claims` table. All the data in the column will be lost.
  - You are about to drop the column `employer_fein` on the `claims` table. All the data in the column will be lost.
  - You are about to drop the column `employer_name` on the `claims` table. All the data in the column will be lost.
  - You are about to drop the column `injury_type` on the `claims` table. All the data in the column will be lost.
  - You are about to drop the column `insurance_carrier` on the `claims` table. All the data in the column will be lost.
  - The `claim_status` column on the `claims` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `order` on the `modules` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `profiles` table. All the data in the column will be lost.
  - The `role` column on the `profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `order` on the `quiz_answers` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `quiz_questions` table. All the data in the column will be lost.
  - The `status` column on the `subscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[wcc_file_number]` on the table `claims` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `module_order` to the `modules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_order` to the `quiz_questions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `user_progress` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('OPEN', 'CLOSED', 'PENDING', 'DENIED', 'ACCEPTED', 'INVESTIGATING', 'IN_LITIGATION', 'PENDING_REVIEW', 'SETTLED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('FULL_DUTY', 'LIGHT_DUTY', 'MODIFIED_DUTY', 'OFF_WORK', 'RETURNED_TO_WORK_FULL', 'RETURNED_TO_WORK_MODIFIED');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "claims" DROP COLUMN "body_parts_injured",
DROP COLUMN "carrier_code",
DROP COLUMN "employer_address",
DROP COLUMN "employer_fein",
DROP COLUMN "employer_name",
DROP COLUMN "injury_type",
DROP COLUMN "insurance_carrier",
ADD COLUMN     "average_weekly_wage" DECIMAL(10,2),
ADD COLUMN     "cause_of_injury" TEXT,
ADD COLUMN     "claimant_attorney_address" TEXT,
ADD COLUMN     "claimant_attorney_email" TEXT,
ADD COLUMN     "claimant_attorney_firm" TEXT,
ADD COLUMN     "claimant_attorney_name" TEXT,
ADD COLUMN     "claimant_attorney_phone" TEXT,
ADD COLUMN     "compensation_rate" DECIMAL(10,2),
ADD COLUMN     "current_work_status" "WorkStatus",
ADD COLUMN     "date_disability_began" DATE,
ADD COLUMN     "date_returned_to_work" DATE,
ADD COLUMN     "employer_id" UUID,
ADD COLUMN     "initial_treatment_desc" TEXT,
ADD COLUMN     "mmi_date" DATE,
ADD COLUMN     "nature_of_injury" TEXT,
ADD COLUMN     "part_of_body_injured" TEXT,
ADD COLUMN     "permanent_impairment_rating" INTEGER,
ADD COLUMN     "place_of_injury" TEXT,
ADD COLUMN     "time_of_injury" TEXT,
DROP COLUMN "claim_status",
ADD COLUMN     "claim_status" "ClaimStatus" DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "injured_workers" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "marital_status" "MaritalStatus",
ADD COLUMN     "middle_name" TEXT,
ADD COLUMN     "num_dependents" INTEGER,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "suffix" TEXT,
ADD COLUMN     "work_phone_number" TEXT,
ALTER COLUMN "last_accessed_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "modules" DROP COLUMN "order",
ADD COLUMN     "module_order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "full_name",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone_number" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" DEFAULT 'USER';

-- AlterTable
ALTER TABLE "quiz_answers" DROP COLUMN "order",
ADD COLUMN     "answer_order" INTEGER;

-- AlterTable
ALTER TABLE "quiz_questions" DROP COLUMN "order",
ADD COLUMN     "question_order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "status",
ADD COLUMN     "status" "SubscriptionStatus";

-- AlterTable
ALTER TABLE "user_progress" DROP COLUMN "status",
ADD COLUMN     "status" "ProgressStatus" NOT NULL;

-- CreateTable
CREATE TABLE "employers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "fein" TEXT,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "phone_number" TEXT,
    "insurance_carrier_name" TEXT,
    "insurance_policy_number" TEXT,
    "carrier_code" TEXT,
    "contact_person_name" TEXT,
    "contact_person_phone" TEXT,
    "contact_person_email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_loss_body_parts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "statutorySection" TEXT,
    "maxWeeksCompensation" INTEGER NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_loss_body_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_impairment_entries" (
    "id" UUID NOT NULL,
    "claim_id" UUID NOT NULL,
    "scheduled_loss_body_part_id" TEXT NOT NULL,
    "percentageImpairment" DECIMAL(5,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claim_impairment_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_providers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "specialty" TEXT,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "phone_number" TEXT,
    "fax_number" TEXT,
    "email_address" TEXT,
    "npi_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_medical_providers" (
    "claim_id" UUID NOT NULL,
    "medical_provider_id" UUID NOT NULL,
    "date_of_first_visit" DATE,
    "date_of_last_visit" DATE,
    "notes" TEXT,

    CONSTRAINT "claim_medical_providers_pkey" PRIMARY KEY ("claim_id","medical_provider_id")
);

-- CreateTable
CREATE TABLE "forms_generated" (
    "id" UUID NOT NULL,
    "form_type" TEXT NOT NULL,
    "description" TEXT,
    "injured_worker_id" UUID NOT NULL,
    "claim_id" UUID,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generated_by_profile_id" UUID NOT NULL,
    "file_path" TEXT,
    "file_name" TEXT,
    "form_data_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forms_generated_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employers_fein_key" ON "employers"("fein");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_loss_body_parts_name_key" ON "scheduled_loss_body_parts"("name");

-- CreateIndex
CREATE INDEX "claim_impairment_entries_claim_id_idx" ON "claim_impairment_entries"("claim_id");

-- CreateIndex
CREATE INDEX "claim_impairment_entries_scheduled_loss_body_part_id_idx" ON "claim_impairment_entries"("scheduled_loss_body_part_id");

-- CreateIndex
CREATE UNIQUE INDEX "medical_providers_npi_number_key" ON "medical_providers"("npi_number");

-- CreateIndex
CREATE INDEX "forms_generated_generated_by_profile_id_idx" ON "forms_generated"("generated_by_profile_id");

-- CreateIndex
CREATE INDEX "forms_generated_injured_worker_id_idx" ON "forms_generated"("injured_worker_id");

-- CreateIndex
CREATE INDEX "forms_generated_claim_id_idx" ON "forms_generated"("claim_id");

-- CreateIndex
CREATE UNIQUE INDEX "claims_wcc_file_number_key" ON "claims"("wcc_file_number");

-- CreateIndex
CREATE INDEX "claims_profile_id_idx" ON "claims"("profile_id");

-- CreateIndex
CREATE INDEX "claims_injured_worker_id_idx" ON "claims"("injured_worker_id");

-- CreateIndex
CREATE INDEX "claims_employer_id_idx" ON "claims"("employer_id");

-- CreateIndex
CREATE INDEX "injured_workers_profile_id_idx" ON "injured_workers"("profile_id");

-- CreateIndex
CREATE INDEX "notes_profile_id_idx" ON "notes"("profile_id");

-- CreateIndex
CREATE INDEX "notes_claim_id_idx" ON "notes"("claim_id");

-- CreateIndex
CREATE INDEX "notes_injured_worker_id_idx" ON "notes"("injured_worker_id");

-- CreateIndex
CREATE INDEX "saved_calculations_profile_id_idx" ON "saved_calculations"("profile_id");

-- CreateIndex
CREATE INDEX "saved_calculations_claim_id_idx" ON "saved_calculations"("claim_id");

-- CreateIndex
CREATE INDEX "saved_calculations_injured_worker_id_idx" ON "saved_calculations"("injured_worker_id");

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_impairment_entries" ADD CONSTRAINT "claim_impairment_entries_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_impairment_entries" ADD CONSTRAINT "claim_impairment_entries_scheduled_loss_body_part_id_fkey" FOREIGN KEY ("scheduled_loss_body_part_id") REFERENCES "scheduled_loss_body_parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_medical_providers" ADD CONSTRAINT "claim_medical_providers_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_medical_providers" ADD CONSTRAINT "claim_medical_providers_medical_provider_id_fkey" FOREIGN KEY ("medical_provider_id") REFERENCES "medical_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forms_generated" ADD CONSTRAINT "forms_generated_injured_worker_id_fkey" FOREIGN KEY ("injured_worker_id") REFERENCES "injured_workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forms_generated" ADD CONSTRAINT "forms_generated_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forms_generated" ADD CONSTRAINT "forms_generated_generated_by_profile_id_fkey" FOREIGN KEY ("generated_by_profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
