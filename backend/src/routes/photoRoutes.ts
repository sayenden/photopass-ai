import express from 'express';
import multer from 'multer';
import { PhotoService } from '../services/PhotoService';
import { ComplianceService } from '../services/ComplianceService';
import { validatePhotoRequest } from '../middleware/validation';
import { logger } from '../utils/logger';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Process photo with background replacement
router.post('/process', upload.single('photo'), validatePhotoRequest, async (req, res, next) => {
  try {
    const { country, photoType, backgroundColor } = req.body;
    const photoBuffer = req.file?.buffer;

    if (!photoBuffer) {
      return res.status(400).json({ error: 'No photo provided' });
    }

    const processedPhoto = await PhotoService.replaceBackground(
      photoBuffer,
      backgroundColor || 'white'
    );

    res.json({
      processedPhoto: processedPhoto.toString('base64'),
      mimeType: 'image/jpeg'
    });

  } catch (error) {
    logger.error('Photo processing error:', error);
    next(error);
  }
});

// Check compliance
router.post('/compliance', upload.single('photo'), validatePhotoRequest, async (req, res, next) => {
  try {
    const { country, photoType } = req.body;
    const photoBuffer = req.file?.buffer;

    if (!photoBuffer) {
      return res.status(400).json({ error: 'No photo provided' });
    }

    const complianceResult = await ComplianceService.checkCompliance(
      photoBuffer,
      country,
      photoType
    );

    res.json(complianceResult);

  } catch (error) {
    logger.error('Compliance check error:', error);
    next(error);
  }
});

// Generate final photos (single + print sheet)
router.post('/generate', upload.single('photo'), validatePhotoRequest, async (req, res, next) => {
  try {
    const { country, photoType, cropData } = req.body;
    const photoBuffer = req.file?.buffer;

    if (!photoBuffer) {
      return res.status(400).json({ error: 'No photo provided' });
    }

    const result = await PhotoService.generateFinalPhotos(
      photoBuffer,
      country,
      photoType,
      JSON.parse(cropData)
    );

    res.json({
      singlePhoto: result.singlePhoto.toString('base64'),
      printSheet: result.printSheet.toString('base64'),
      mimeType: 'image/jpeg'
    });

  } catch (error) {
    logger.error('Photo generation error:', error);
    next(error);
  }
});

export default router;
