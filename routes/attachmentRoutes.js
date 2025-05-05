import express from 'express';
import { uploadAttachment, getAttachments } from '../controllers/attachmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect);
router.post('/', upload.single('file'), uploadAttachment);
router.get('/', getAttachments);

export default router;
