import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import prisma from '../utils/db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Cloudinary configuration (optional, active if keys exist)
const isCloudinaryActive = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryActive) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

router.use(authenticateToken as any);

// Get documents
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const docs = await prisma.document.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload document
router.post('/upload', upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, expiryDate } = req.body;
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    let fileUrl = `/uploads/${req.file.filename}`;
    const fileType = path.extname(req.file.originalname).substring(1).toLowerCase();

    if (isCloudinaryActive) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'life_admin_documents',
          resource_type: 'auto',
        });
        fileUrl = result.secure_url;
        // Delete local temporary file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (err) {
        console.error('Cloudinary upload failed, falling back to local storage:', err);
      }
    }

    const doc = await prisma.document.create({
      data: {
        name: name || req.file.originalname,
        category: category || 'Others',
        fileUrl,
        fileType,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        userId: req.userId!,
      },
    });

    res.status(201).json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const doc = await prisma.document.findFirst({
      where: { id, userId: req.userId },
    });
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Delete file
    if (doc.fileUrl.includes('cloudinary.com')) {
      try {
        const parts = doc.fileUrl.split('/');
        const filenameWithExtension = parts[parts.length - 1];
        const filename = filenameWithExtension.split('.')[0];
        const publicId = `life_admin_documents/${filename}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Failed to delete file from Cloudinary:', err);
      }
    } else {
      const filename = path.basename(doc.fileUrl);
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.document.delete({ where: { id } });
    res.json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
