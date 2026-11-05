import { Router } from 'express';
import { getDonors, createDonor, updateDonor, deleteDonor } from '../controllers/donorController.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getDonors));
router.post('/', authenticate, asyncHandler(createDonor));
router.put('/:id', authenticate, asyncHandler(updateDonor));
router.delete('/:id', authenticate, asyncHandler(deleteDonor));

export default router;
