CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "hashedRefreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Session_userID_idx" ON "Session"("userID");
CREATE INDEX "Session_expireAt_idx" ON "Session"("expireAt");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
