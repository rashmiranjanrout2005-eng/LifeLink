import { Router } from 'express';
import { getHospitals, createHospital, updateHospital } from '../controllers/hospitalController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authenticate, asyncHandler(getHospitals));
router.post('/', authenticate, asyncHandler(authorizeRoles('hospital', 'admin')), asyncHandler(createHospital));
router.put('/:id', authenticate, asyncHandler(authorizeRoles('hospital', 'admin')), asyncHandler(updateHospital));

export default router;
