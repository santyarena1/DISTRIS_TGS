-- CreateTable
CREATE TABLE "DistributorConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "distributor" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "credentials" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DistributorConfig_distributor_key" ON "DistributorConfig"("distributor");
