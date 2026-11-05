import { Router } from 'express';
import { getRequests, createRequest, getRequestById, updateRequestStatus } from '../controllers/requestController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authenticate, asyncHandler(getRequests));
router.post('/', authenticate, asyncHandler(createRequest));
router.get('/:id', authenticate, asyncHandler(getRequestById));
router.put('/:id/status', authenticate, asyncHandler(authorizeRoles('admin')), asyncHandler(updateRequestStatus));

export default router;
