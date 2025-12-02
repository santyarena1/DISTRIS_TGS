"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncNewBytes = syncNewBytes;
const db_1 = __importDefault(require("./db"));
const newbytesClient_1 = require("./newbytesClient");
/**
 * Attempt to interpret a value as a number. If the value cannot be parsed,
 * return undefined.
 */
function toNumber(value) {
    if (value === null || value === undefined)
        return undefined;
    const num = typeof value === 'string' ? Number(value.replace(/[^0-9.-]+/g, '')) : Number(value);
    return isNaN(num) ? undefined : num;
}
/**
 * Normalize a raw CSV row into our internal product representation. This
 * function makes a best-effort attempt to extract useful fields from the
 * supplier data. If a particular field is not present, reasonable defaults
 * (e.g. null or 0) are returned.
 */
function mapToInternalModel(item) {
    var _a, _b, _c, _d, _e;
    // Helper to find the first defined value from a list of possible field names.
    const firstDefined = (...keys) => {
        for (const key of keys) {
            if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
                return item[key];
            }
        }
        return undefined;
    };
    // Determine supplier_code: try sku/code/id fields.
    const supplierCode = String((_a = firstDefined('sku', 'SKU', 'code', 'codigo', 'id', 'ID')) !== null && _a !== void 0 ? _a : '');
    // Determine name/title.
    const name = String((_b = firstDefined('title', 'name', 'nombre', 'description', 'descripcion')) !== null && _b !== void 0 ? _b : 'Producto sin nombre');
    // Optional description. We prefer a longer description if available.
    const description = firstDefined('description', 'descripcion_larga', 'descripcion', 'name');
    // Brand and category.
    const brand = firstDefined('brand', 'marca');
    const category = String((_c = firstDefined('category', 'categoria')) !== null && _c !== void 0 ? _c : 'Sin categoría');
    // Price: try finalPrice, price, value, precio. Use parseFloat on numeric strings.
    const priceFields = firstDefined('finalPrice', 'final_price', 'price', 'value', 'precio');
    const price = (_d = toNumber(priceFields)) !== null && _d !== void 0 ? _d : 0;
    // Currency: not explicitly provided in the CSV. Default to ARS.
    const currency = String((_e = firstDefined('currency', 'moneda')) !== null && _e !== void 0 ? _e : 'ARS');
    // Stock: attempt to parse numeric values; treat non-numeric truthy values as 1.
    const stockField = firstDefined('amountStock', 'stock', 'stockDisponible', 'cantidad');
    let stock;
    const parsedStock = toNumber(stockField);
    if (parsedStock !== undefined) {
        stock = parsedStock;
    }
    else {
        // For non-numeric indicators (e.g. "Sin stock"), interpret truthy as 1.
        stock = stockField ? 1 : 0;
    }
    return {
        supplier: 'newbytes',
        supplier_code: supplierCode,
        name,
        description: description !== null && description !== void 0 ? description : null,
        brand: brand !== null && brand !== void 0 ? brand : null,
        category,
        price,
        currency,
        stock,
        // Guardamos el objeto original y lo stringificamos al momento de persistir.
        raw_data: item,
    };
}
/**
 * Sync products from the New Bytes price list into the local database.
 *
 * The function fetches the supplier data, normalizes it and performs
 * upserts (insert or update) based on the compound unique key
 * `supplier` + `supplier_code`. It returns a summary of the operation.
 */
async function syncNewBytes() {
    const products = await (0, newbytesClient_1.fetchNewBytesProducts)();
    let created = 0;
    let updated = 0;
    for (const item of products) {
        const normalized = mapToInternalModel(item);
        if (!normalized.supplier_code) {
            // Skip items without a unique identifier.
            continue;
        }
        const where = {
            supplier_supplier_code: {
                supplier: normalized.supplier,
                supplier_code: normalized.supplier_code,
            },
        };
        const existing = await db_1.default.product.findUnique({ where });
        if (existing) {
            updated++;
        }
        else {
            created++;
        }
        await db_1.default.product.upsert({
            where,
            update: {
                name: normalized.name,
                description: normalized.description,
                brand: normalized.brand,
                category: normalized.category,
                price: normalized.price,
                currency: normalized.currency,
                stock: normalized.stock,
                raw_data: JSON.stringify(normalized.raw_data), // 👈 acá lo guardamos como string
            },
            create: {
                supplier: normalized.supplier,
                supplier_code: normalized.supplier_code,
                name: normalized.name,
                description: normalized.description,
                brand: normalized.brand,
                category: normalized.category,
                price: normalized.price,
                currency: normalized.currency,
                stock: normalized.stock,
                raw_data: JSON.stringify(normalized.raw_data), // 👈 y acá también
            },
        });
    }
    return {
        totalFetched: products.length,
        created,
        updated,
    };
}
