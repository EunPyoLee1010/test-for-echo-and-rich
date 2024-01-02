-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "Log";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "User";

-- CreateEnum
CREATE TYPE "User"."LoginType" AS ENUM ('google', 'kakao', 'naver', 'system');

-- CreateEnum
CREATE TYPE "Log"."LogLevel" AS ENUM ('info', 'debug', 'verbose', 'error', 'warn');

-- CreateTable
CREATE TABLE "User"."User" (
    "id" UUID NOT NULL,
    "login_id" VARCHAR(50) NOT NULL,
    "login_type" "User"."LoginType" NOT NULL,
    "passwd_enc" VARCHAR(88) NOT NULL,
    "passwd_salt" VARCHAR(88) NOT NULL,
    "name" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "picture_url" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log"."Log" (
    "id" UUID NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "server_name" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "level" "Log"."LogLevel" NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_id_key" ON "User"."User"("login_id");
