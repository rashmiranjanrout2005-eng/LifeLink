import { Router } from 'express';
import { getDonors, createDonor, updateDonor, deleteDonor } from '../controllers/donorController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', getDonors);
router.post('/', authenticate, createDonor);
router.put('/:id', authenticate, updateDonor);
router.delete('/:id', authenticate, deleteDonor);

export default router;
