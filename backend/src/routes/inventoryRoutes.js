import { Router } from 'express';
import { getInventory, getAvailability, createInventory, updateInventory } from '../controllers/inventoryController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = Router();

router.get('/', authenticate, authorizeRoles('admin'), getInventory);
router.get('/availability', getAvailability);
router.post('/', authenticate, authorizeRoles('admin'), createInventory);
router.put('/:id', authenticate, authorizeRoles('admin'), updateInventory);

export default router;
