-- CreateTable
CREATE TABLE "TgsProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "externalId" INTEGER,
    "name" TEXT NOT NULL,
    "manufacturerSku" TEXT,
    "imageUrl" TEXT,
    "category" TEXT,
    "status" TEXT,
    "price" DECIMAL,
    "currency" TEXT DEFAULT 'ARS',
    "internalSku" TEXT,
    "stock" INTEGER DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TgsProduct_internalSku_key" ON "TgsProduct"("internalSku");
