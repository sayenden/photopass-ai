import sharp from 'sharp';
import { GoogleGenAI, Modality } from '@google/genai';
import { logger } from '../utils/logger';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export class PhotoService {
  static async replaceBackground(photoBuffer: Buffer, backgroundColor: string): Promise<Buffer> {
    try {
      // Convert to base64 for Gemini API
      const base64Image = photoBuffer.toString('base64');
      
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });
      
      const response = await model.generateContent({
        contents: [{
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: 'image/jpeg'
              }
            },
            {
              text: `Replace the background of this portrait with a solid, uniform, plain ${backgroundColor} color suitable for an official passport photo. Ensure there are no shadows and the subject is clearly separated from the new background.`
            }
          ]
        }],
        config: {
          responseModalities: [Modality.IMAGE]
        }
      });

      // Extract image from response
      for (const part of response.response.candidates![0].content.parts) {
        if (part.inlineData) {
          return Buffer.from(part.inlineData.data, 'base64');
        }
      }
      
      throw new Error('No image returned from AI service');
      
    } catch (error) {
      logger.error('Background replacement failed:', error);
      throw new Error('Failed to replace background');
    }
  }

  static async generateFinalPhotos(
    photoBuffer: Buffer, 
    country: string, 
    photoType: string, 
    cropData: { zoom: number; position: { x: number; y: number } }
  ): Promise<{ singlePhoto: Buffer; printSheet: Buffer }> {
    try {
      // Get photo requirements based on country and type
      const requirements = this.getPhotoRequirements(country, photoType);
      
      // Process single photo
      const singlePhoto = await sharp(photoBuffer)
        .resize(requirements.widthPx, requirements.heightPx, {
          fit: 'cover',
          position: sharp.strategy.attention
        })
        .jpeg({ quality: 95 })
        .toBuffer();

      // Generate print sheet (4x6 inch at 300 DPI = 1200x1800 px)
      const printSheet = await this.generatePrintSheet(singlePhoto, requirements);

      return { singlePhoto, printSheet };
      
    } catch (error) {
      logger.error('Photo generation failed:', error);
      throw new Error('Failed to generate photos');
    }
  }

  private static async generatePrintSheet(singlePhoto: Buffer, requirements: any): Promise<Buffer> {
    const sheetWidth = 1800; // 6 inches at 300 DPI
    const sheetHeight = 1200; // 4 inches at 300 DPI
    
    // Calculate how many photos fit
    const photosAcross = Math.floor(sheetWidth / requirements.widthPx);
    const photosDown = Math.floor(sheetHeight / requirements.heightPx);
    
    // Create composite array
    const composite = [];
    for (let row = 0; row < photosDown; row++) {
      for (let col = 0; col < photosAcross; col++) {
        composite.push({
          input: singlePhoto,
          left: col * requirements.widthPx,
          top: row * requirements.heightPx
        });
      }
    }

    return sharp({
      create: {
        width: sheetWidth,
        height: sheetHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
    .composite(composite)
    .jpeg({ quality: 95 })
    .toBuffer();
  }

  private static getPhotoRequirements(country: string, photoType: string) {
    // This should match your frontend constants
    const requirements: Record<string, any> = {
      'US_passport': { widthPx: 600, heightPx: 600 },
      'CA_passport': { widthPx: 428, heightPx: 600 },
      'GB_passport': { widthPx: 467, heightPx: 600 },
      // Add more as needed
    };
    
    const key = `${country}_${photoType.toLowerCase().replace(/\s+/g, '_')}`;
    return requirements[key] || { widthPx: 600, heightPx: 600 };
  }
}
