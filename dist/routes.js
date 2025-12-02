"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("./db"));
const syncService_1 = require("./syncService");
const router = (0, express_1.Router)();
// Health check endpoint. Useful for uptime monitoring or load balancers.
router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
// Trigger synchronization from New Bytes. Returns a summary of the sync.
router.post('/sync/newbytes', async (_req, res) => {
    var _a;
    try {
        const result = await (0, syncService_1.syncNewBytes)();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: (_a = error.message) !== null && _a !== void 0 ? _a : 'Unexpected error' });
    }
});
// GET /products
// Supports simple filtering (q for name/description, minPrice, maxPrice, brand)
// and pagination (page, limit). Returns an array of products.
router.get('/products', async (req, res) => {
    var _a;
    const { q, minPrice, maxPrice, brand, page = '1', limit = '10', } = req.query;
    const where = {};
    if (q && typeof q === 'string') {
        where.OR = [
            {
                name: {
                    contains: q,
                    mode: 'insensitive',
                },
            },
            {
                description: {
                    contains: q,
                    mode: 'insensitive',
                },
            },
        ];
    }
    if (brand && typeof brand === 'string') {
        where.brand = {
            equals: brand,
            mode: 'insensitive',
        };
    }
    // Build price filter
    const priceFilter = {};
    if (minPrice && !isNaN(Number(minPrice))) {
        priceFilter.gte = Number(minPrice);
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
        priceFilter.lte = Number(maxPrice);
    }
    if (Object.keys(priceFilter).length > 0) {
        where.price = priceFilter;
    }
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
    try {
        const products = await db_1.default.product.findMany({
            where,
            skip: (pageNumber - 1) * limitNumber,
            take: limitNumber,
            orderBy: {
                id: 'asc',
            },
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: (_a = error.message) !== null && _a !== void 0 ? _a : 'Unexpected error' });
    }
});
// GET /products/:id – Fetch a single product by its numeric id. Returns 404 if not found.
router.get('/products/:id', async (req, res) => {
    var _a;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    try {
        const product = await db_1.default.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: (_a = error.message) !== null && _a !== void 0 ? _a : 'Unexpected error' });
    }
});
exports.default = router;
