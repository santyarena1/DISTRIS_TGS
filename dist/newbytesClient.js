"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchNewBytesProducts = fetchNewBytesProducts;
const axios_1 = __importDefault(require("axios"));
const sync_1 = require("csv-parse/sync");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
/**
 * Fetch the full price list from the New Bytes CSV endpoint.
 *
 * The New Bytes API exposes a CSV file containing the current price list.
 * A valid token must be provided via the NEWBYTES_TOKEN environment variable.
 *
 * @throws Error if the token is not defined or the request fails.
 * @returns A list of objects parsed from the CSV. Each row is represented as
 *          a record keyed by the CSV headers.
 */
async function fetchNewBytesProducts() {
    var _a, _b, _c;
    const token = process.env.NEWBYTES_TOKEN;
    if (!token) {
        throw new Error('NEWBYTES_TOKEN is not defined in environment');
    }
    // Podés cambiar la base desde .env si querés (por ejemplo a https más adelante)
    const baseUrl = (_a = process.env.NEWBYTES_BASE_URL) !== null && _a !== void 0 ? _a : 'http://api.nb.com.ar';
    // Nos aseguramos de no tener barras dobles
    const normalizedBase = baseUrl.replace(/\/+$/, '');
    const url = `${normalizedBase}/v1/priceListCsv/${encodeURIComponent(token)}`;
    try {
        const response = await axios_1.default.get(url, {
            responseType: 'text',
            timeout: 30000,
        });
        const records = (0, sync_1.parse)(response.data, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });
        return records;
    }
    catch (error) {
        // Log al servidor para que vos veas el detalle en consola
        console.error('New Bytes API error:', {
            message: error === null || error === void 0 ? void 0 : error.message,
            code: error === null || error === void 0 ? void 0 : error.code,
            status: (_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.status,
        });
        const statusInfo = ((_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.status) ? `: HTTP ${error.response.status}` : '';
        throw new Error(`Failed to fetch New Bytes price list${statusInfo}`);
    }
}
