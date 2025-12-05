/*
  Warnings:

  - You are about to drop the column `alto_cm` on the `GrupoNucleoProduct` table. All the data in the column will be lost.
  - You are about to drop the column `ancho_cm` on the `GrupoNucleoProduct` table. All the data in the column will be lost.
  - You are about to drop the column `ean` on the `GrupoNucleoProduct` table. All the data in the column will be lost.
  - You are about to drop the column `impuestos` on the `GrupoNucleoProduct` table. All the data in the column will be lost.
  - You are about to drop the column `largo_cm` on the `GrupoNucleoProduct` table. All the data in the column will be lost.
  - You are about to drop the column `partNumber` on the `GrupoNucleoProduct` table. All the data in the column will be lost.
  - You are about to drop the column `peso_gr` on the `GrupoNucleoProduct` table. All the data in the column will be lost.
  - You are about to drop the column `precioNeto_USD` on the `GrupoNucleoProduct` table. All the data in the column will be lost.
  - You are about to drop the column `stock_caba` on the `GrupoNucleoProduct` table. All the data in the column will be lost.
  - You are about to drop the column `stock_mdp` on the `GrupoNucleoProduct` table. All the data in the column will be lost.
  - You are about to drop the column `subcategoria` on the `GrupoNucleoProduct` table. All the data in the column will be lost.
  - You are about to drop the column `url_imagenes` on the `GrupoNucleoProduct` table. All the data in the column will be lost.
  - You are about to drop the column `volumen_cm3` on the `GrupoNucleoProduct` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GrupoNucleoProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "item_id" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "item_desc_0" TEXT,
    "item_desc_1" TEXT,
    "item_desc_2" TEXT,
    "marca" TEXT,
    "categoria" TEXT,
    "stock" TEXT,
    "precio" TEXT,
    "moneda" TEXT,
    "raw_data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_GrupoNucleoProduct" ("categoria", "codigo", "createdAt", "id", "item_desc_0", "item_desc_1", "item_desc_2", "item_id", "marca", "raw_data", "updatedAt") SELECT "categoria", "codigo", "createdAt", "id", "item_desc_0", "item_desc_1", "item_desc_2", "item_id", "marca", "raw_data", "updatedAt" FROM "GrupoNucleoProduct";
DROP TABLE "GrupoNucleoProduct";
ALTER TABLE "new_GrupoNucleoProduct" RENAME TO "GrupoNucleoProduct";
CREATE UNIQUE INDEX "GrupoNucleoProduct_item_id_key" ON "GrupoNucleoProduct"("item_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
