import { Router } from 'express';
import multer from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { pool } from '../config/database';
import { authenticate, requireRole } from '../middlewares/auth';
import { env } from '../config/env';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), env.UPLOAD_DIR, 'vehicles');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `vehicle-${uniqueSuffix}.${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Upload vehicle images (admin only)
router.post('/vehicles', authenticate, requireRole('admin'), upload.array('images', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files as Express.Multer.File[];
    const imageUrls = files.map(file => `/api/uploads/vehicles/${file.filename}`);

    res.json({ 
      images: imageUrls,
      message: `Successfully uploaded ${files.length} image(s)` 
    });
  } catch (error) {
    next(error);
  }
});

// Delete vehicle image (admin only)
router.delete('/vehicles/:filename', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = join(process.cwd(), env.UPLOAD_DIR, 'vehicles', filename);

    // Check if file exists
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Remove from database if referenced in vehicles
    await pool.query(
      `UPDATE vehicles 
       SET images = images::jsonb - (SELECT index FROM jsonb_array_elements(images) WITH ORDINALITY arr(item, index) WHERE item::text = $1)
       WHERE images::jsonb @> $2::jsonb`,
      [`"/api/uploads/vehicles/${filename}"`, `["/api/uploads/vehicles/${filename}"]`]
    );

    // Delete file (optional - can be done via cron job instead)
    // unlinkSync(filePath);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;


