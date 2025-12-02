import { PrismaClient } from '@prisma/client';

// Instantiate a single PrismaClient. Creating multiple instances can lead to
// connection issues in certain runtimes (e.g. serverless). Here, a singleton
// pattern avoids multiple connections when modules import the client.
const prisma = new PrismaClient();

export default prisma;
