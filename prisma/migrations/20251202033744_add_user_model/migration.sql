/*
  Warnings:

  - You are about to drop the column `COTIZACION_DOLAR` on the `NewBytesProduct` table. All the data in the column will be lost.
  - You are about to drop the column `ID_FABRICANTE` on the `NewBytesProduct` table. All the data in the column will be lost.
  - You are about to drop the column `PRECIO_FINAL` on the `NewBytesProduct` table. All the data in the column will be lost.
  - You are about to drop the column `PRECIO_PESOS_CON_IVA` on the `NewBytesProduct` table. All the data in the column will be lost.
  - You are about to drop the column `PRECIO_PESOS_CON_UTILIDAD` on the `NewBytesProduct` table. All the data in the column will be lost.
  - You are about to drop the column `PRECIO_PESOS_SIN_IVA` on the `NewBytesProduct` table. All the data in the column will be lost.
  - You are about to drop the column `PRECIO_USD_CON_UTILIDAD` on the `NewBytesProduct` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `NewBytesProduct` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "GrupoNucleoProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "item_id" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "ean" TEXT,
    "partNumber" TEXT,
    "item_desc_0" TEXT,
    "item_desc_1" TEXT,
    "item_desc_2" TEXT,
    "marca" TEXT,
    "categoria" TEXT,
    "subcategoria" TEXT,
    "peso_gr" INTEGER,
    "alto_cm" INTEGER,
    "ancho_cm" INTEGER,
    "largo_cm" INTEGER,
    "volumen_cm3" INTEGER,
    "precioNeto_USD" REAL,
    "impuestos" TEXT,
    "stock_mdp" INTEGER,
    "stock_caba" INTEGER,
    "url_imagenes" TEXT,
    "raw_data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NewBytesProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "CODIGO" TEXT NOT NULL,
    "ID FABRICANTE" TEXT,
    "CATEGORIA" TEXT,
    "DETALLE" TEXT,
    "IMAGEN" TEXT,
    "IVA" TEXT,
    "STOCK" TEXT,
    "GARANTIA" TEXT,
    "MONEDA" TEXT,
    "PRECIO" TEXT,
    "PRECIO FINAL" TEXT,
    "COTIZACION DOLAR" TEXT,
    "PRECIO PESOS SIN IVA" TEXT,
    "PRECIO PESOS CON IVA" TEXT,
    "ATRIBUTOS" TEXT,
    "PRECIO USD CON UTILIDAD" TEXT,
    "PRECIO PESOS CON UTILIDAD" TEXT,
    "CATEGORIA_USUARIO" TEXT,
    "UTILIDAD" TEXT,
    "DETALLE_USUARIO" TEXT,
    "PESO" TEXT,
    "ALTO" TEXT,
    "ANCHO" TEXT,
    "LARGO" TEXT,
    "IMPUESTO_INTERNO" TEXT,
    "MARCA" TEXT,
    "raw_data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_NewBytesProduct" ("ALTO", "ANCHO", "ATRIBUTOS", "CATEGORIA", "CATEGORIA_USUARIO", "CODIGO", "DETALLE", "DETALLE_USUARIO", "GARANTIA", "IMAGEN", "IMPUESTO_INTERNO", "IVA", "LARGO", "MARCA", "MONEDA", "PESO", "PRECIO", "STOCK", "UTILIDAD", "id", "raw_data") SELECT "ALTO", "ANCHO", "ATRIBUTOS", "CATEGORIA", "CATEGORIA_USUARIO", "CODIGO", "DETALLE", "DETALLE_USUARIO", "GARANTIA", "IMAGEN", "IMPUESTO_INTERNO", "IVA", "LARGO", "MARCA", "MONEDA", "PESO", "PRECIO", "STOCK", "UTILIDAD", "id", "raw_data" FROM "NewBytesProduct";
DROP TABLE "NewBytesProduct";
ALTER TABLE "new_NewBytesProduct" RENAME TO "NewBytesProduct";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "GrupoNucleoProduct_codigo_key" ON "GrupoNucleoProduct"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
