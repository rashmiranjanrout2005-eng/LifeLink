import { Router } from 'express';
import { getRequests, createRequest, getRequestById, updateRequestStatus } from '../controllers/requestController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = Router();

router.get('/', authenticate, getRequests);
router.post('/', authenticate, createRequest);
router.get('/:id', authenticate, getRequestById);
router.put('/:id/status', authenticate, authorizeRoles('admin'), updateRequestStatus);

export default router;
