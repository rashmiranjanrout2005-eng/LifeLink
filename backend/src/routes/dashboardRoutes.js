import { Router } from 'express';
import { getStats, getCharts } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/stats', authenticate, asyncHandler(authorizeRoles('admin')), asyncHandler(getStats));
router.get('/charts', authenticate, asyncHandler(authorizeRoles('admin')), asyncHandler(getCharts));

export default router;
