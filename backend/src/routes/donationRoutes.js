import { Router } from 'express';
import { getDonations, createDonation } from '../controllers/donationController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = Router();

router.get('/', authenticate, getDonations);
router.post('/', authenticate, authorizeRoles('donor', 'admin'), createDonation);

export default router;
