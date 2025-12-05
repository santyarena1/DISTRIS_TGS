-- CreateTable
CREATE TABLE "ElitProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "elitId" INTEGER NOT NULL,
    "codigoAlfa" TEXT,
    "codigoProducto" TEXT,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT,
    "subCategoria" TEXT,
    "marca" TEXT,
    "precio" DECIMAL,
    "impuestoInterno" DECIMAL,
    "iva" DECIMAL,
    "moneda" INTEGER,
    "markup" DECIMAL,
    "cotizacion" DECIMAL,
    "pvpUsd" DECIMAL,
    "pvpArs" DECIMAL,
    "peso" REAL,
    "ean" TEXT,
    "nivelStock" TEXT,
    "stockTotal" INTEGER,
    "stockDepositoCliente" INTEGER,
    "stockDepositoCd" INTEGER,
    "garantia" TEXT,
    "link" TEXT,
    "gamer" BOOLEAN,
    "creado" DATETIME,
    "actualizado" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ElitProduct_elitId_key" ON "ElitProduct"("elitId");
