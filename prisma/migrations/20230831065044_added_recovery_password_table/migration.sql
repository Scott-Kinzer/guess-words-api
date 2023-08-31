-- CreateTable
CREATE TABLE "UserPasswordRecoveryAuth" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "pincode" TEXT,
    "pincodeCreatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPasswordRecoveryAuth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPasswordRecoveryAuth_userId_key" ON "UserPasswordRecoveryAuth"("userId");

-- AddForeignKey
ALTER TABLE "UserPasswordRecoveryAuth" ADD CONSTRAINT "UserPasswordRecoveryAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
