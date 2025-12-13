-- CreateTable
CREATE TABLE "GamingCityProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "precio" REAL NOT NULL,
    "categoria" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 100,
    "updatedAt" DATETIME NOT NULL
);
