import { Router } from 'express';
import { getHospitals, createHospital, updateHospital } from '../controllers/hospitalController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = Router();

router.get('/', authenticate, getHospitals);
router.post('/', authenticate, authorizeRoles('hospital', 'admin'), createHospital);
router.put('/:id', authenticate, authorizeRoles('hospital', 'admin'), updateHospital);

export default router;
