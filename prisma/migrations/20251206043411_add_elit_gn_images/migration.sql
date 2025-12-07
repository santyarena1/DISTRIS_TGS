/*
  Warnings:

  - You are about to drop the column `imagenes` on the `ElitProduct` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ElitProduct" (
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
    "imagenesRaw" TEXT,
    "miniaturasRaw" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ElitProduct" ("actualizado", "categoria", "codigoAlfa", "codigoProducto", "cotizacion", "creado", "createdAt", "ean", "elitId", "gamer", "garantia", "id", "imageUrl", "impuestoInterno", "iva", "link", "marca", "markup", "moneda", "nivelStock", "nombre", "peso", "precio", "pvpArs", "pvpUsd", "stockDepositoCd", "stockDepositoCliente", "stockTotal", "subCategoria", "updatedAt") SELECT "actualizado", "categoria", "codigoAlfa", "codigoProducto", "cotizacion", "creado", "createdAt", "ean", "elitId", "gamer", "garantia", "id", "imageUrl", "impuestoInterno", "iva", "link", "marca", "markup", "moneda", "nivelStock", "nombre", "peso", "precio", "pvpArs", "pvpUsd", "stockDepositoCd", "stockDepositoCliente", "stockTotal", "subCategoria", "updatedAt" FROM "ElitProduct";
DROP TABLE "ElitProduct";
ALTER TABLE "new_ElitProduct" RENAME TO "ElitProduct";
CREATE UNIQUE INDEX "ElitProduct_elitId_key" ON "ElitProduct"("elitId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
