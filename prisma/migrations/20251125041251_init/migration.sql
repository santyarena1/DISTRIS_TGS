/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Product";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "NewBytesProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "CODIGO" TEXT NOT NULL,
    "ID_FABRICANTE" TEXT,
    "CATEGORIA" TEXT,
    "DETALLE" TEXT,
    "IMAGEN" TEXT,
    "IVA" TEXT,
    "STOCK" TEXT,
    "GARANTIA" TEXT,
    "MONEDA" TEXT,
    "PRECIO" TEXT,
    "PRECIO_FINAL" TEXT,
    "COTIZACION_DOLAR" TEXT,
    "PRECIO_PESOS_SIN_IVA" TEXT,
    "PRECIO_PESOS_CON_IVA" TEXT,
    "ATRIBUTOS" TEXT,
    "PRECIO_USD_CON_UTILIDAD" TEXT,
    "PRECIO_PESOS_CON_UTILIDAD" TEXT,
    "CATEGORIA_USUARIO" TEXT,
    "UTILIDAD" TEXT,
    "DETALLE_USUARIO" TEXT,
    "PESO" TEXT,
    "ALTO" TEXT,
    "ANCHO" TEXT,
    "LARGO" TEXT,
    "IMPUESTO_INTERNO" TEXT,
    "MARCA" TEXT,
    "raw_data" TEXT NOT NULL
);
