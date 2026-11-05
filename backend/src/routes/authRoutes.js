import { Router } from 'express';
import { createProfile, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/profile', authenticate, asyncHandler(createProfile));
router.get('/me', authenticate, asyncHandler(me));

export default router;
