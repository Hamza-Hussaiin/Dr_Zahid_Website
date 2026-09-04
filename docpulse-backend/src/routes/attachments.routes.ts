import { Router } from 'express';
import { viewAttachment } from '../controllers/attachments.controller';

const router = Router();

router.get('/:publicId', viewAttachment);

export default router;