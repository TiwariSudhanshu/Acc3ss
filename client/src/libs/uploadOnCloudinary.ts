// lib/uploadOnCloudinary.ts
import cloudinary from './cloudinary';
import fs from 'fs';

interface UploadResult {
  url: string;
  public_id: string;
}

export const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadResult | null> => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    // Remove local file after successful upload
    fs.unlinkSync(localFilePath);

    return {
      url: response.secure_url,
      public_id: response.public_id,
    };
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);

    // Cleanup even on failure
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};
