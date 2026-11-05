import { Router } from 'express';
import { getInventory, getAvailability, createInventory, updateInventory } from '../controllers/inventoryController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authenticate, asyncHandler(authorizeRoles('admin')), asyncHandler(getInventory));
router.get('/availability', asyncHandler(getAvailability));
router.post('/', authenticate, asyncHandler(authorizeRoles('admin')), asyncHandler(createInventory));
router.put('/:id', authenticate, asyncHandler(authorizeRoles('admin')), asyncHandler(updateInventory));

export default router;
