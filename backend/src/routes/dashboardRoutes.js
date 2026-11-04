import { Router } from 'express';
import { getStats, getCharts } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = Router();

router.get('/stats', authenticate, authorizeRoles('admin'), getStats);
router.get('/charts', authenticate, authorizeRoles('admin'), getCharts);

export default router;
