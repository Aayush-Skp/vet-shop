/**
 * Shared Cloudinary Upload Helper
 * Extracts common upload logic used by multiple API routes.
 */
import cloudinary from "./cloudinary";

export interface CloudinaryUploadOptions {
  folder: string;
  maxWidth: number;
  maxHeight: number;
  maxSizeMB: number;
  quality?: string;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Validates and uploads an image file to Cloudinary.
 * @param file - The File object from a FormData request
 * @param options - Upload configuration (folder, dimensions, size limit, quality)
 * @returns The Cloudinary URL, public ID, and dimensions
 * @throws Error if validation fails or upload errors
 */
export async function uploadImageToCloudinary(
  file: File,
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new UploadError("File must be an image", 400);
  }

  // Validate file size
  if (file.size > options.maxSizeMB * 1024 * 1024) {
    throw new UploadError(`Image must be less than ${options.maxSizeMB}MB`, 400);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to Cloudinary with optimization
  const result = await new Promise<Record<string, unknown>>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          resource_type: "image",
          transformation: [
            {
              width: options.maxWidth,
              height: options.maxHeight,
              crop: "limit",
              quality: options.quality || "auto",
              format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as Record<string, unknown>);
        }
      );
      uploadStream.end(buffer);
    }
  );

  return {
    url: result.secure_url as string,
    publicId: result.public_id as string,
    width: result.width as number,
    height: result.height as number,
  };
}

/**
 * Deletes an image from Cloudinary by public ID.
 * Silently catches Cloudinary errors (image may already be gone).
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn("Cloudinary delete failed (image may not exist):", err);
  }
}

/**
 * Custom error class with HTTP status code for upload validation errors.
 */
export class UploadError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "UploadError";
  }
}
