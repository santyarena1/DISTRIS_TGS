import { Router } from 'express';
import { getDistributorConfigs, saveDistributorConfig } from '../controllers/configController';
// Asumimos que tienes un middleware de autenticación (ej: authenticateToken)
// Si no lo tienes importado globalmente, habría que importarlo.
// Por ahora lo dejo abierto, pero deberíamos protegerlo.

const router = Router();

router.get('/', getDistributorConfigs);
router.post('/', saveDistributorConfig);

export default router;