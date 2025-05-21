import multer from 'multer';
import express from 'express';
import * as faceController from '../controllers/faceController.js';

const router = express.Router();
const upload = multer(); // memory storage by default

router.post('/register', upload.single('image'), faceController.registerFace);
router.post('/verify', upload.single('image'), faceController.verifyFace);
router.delete('/delete/:userId', faceController.deleteFace);

export default router;
