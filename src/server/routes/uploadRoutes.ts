import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateJwt, AuthenticatedRequest } from '../../middleware/authMiddleware';
import { logger } from '../../services/loggerService';

export const uploadRouter = Router();

const uploadsDir = path.join(process.cwd(), 'dist/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

uploadRouter.post('/v1/upload', authenticateJwt, upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'NO_FILE', message: 'No se adjuntó ningún archivo.' });
  }
  logger.info(`[FILE UPLOAD] Uploaded ${req.file.filename} by ${req.user?.username}`);
  res.json({
    success: true,
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
  });
});
