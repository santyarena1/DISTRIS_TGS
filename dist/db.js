"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Instantiate a single PrismaClient. Creating multiple instances can lead to
// connection issues in certain runtimes (e.g. serverless). Here, a singleton
// pattern avoids multiple connections when modules import the client.
const prisma = new client_1.PrismaClient();
exports.default = prisma;
