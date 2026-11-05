import { Router } from 'express';
import { getDonations, createDonation } from '../controllers/donationController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authenticate, asyncHandler(getDonations));
router.post('/', authenticate, asyncHandler(authorizeRoles('donor', 'admin')), asyncHandler(createDonation));

export default router;
