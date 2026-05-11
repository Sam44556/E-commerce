const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Upload image to Cloudinary with retry logic
const uploadToCloudinary = async (fileBuffer, folder = 'products', retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'image',
            timeout: 120000, // 120 second timeout
            transformation: [
              { width: 600, height: 600, crop: 'limit' },
              { quality: 'auto:low' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        uploadStream.end(fileBuffer);
      });
      return result; // Success, return the URL
    } catch (error) {
      console.error(`Cloudinary upload attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt === retries) {
        throw error; // All retries exhausted
      }
      // Wait before retrying (1s, 2s, 3s...)
      await new Promise(r => setTimeout(r, attempt * 1000));
    }
  }
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from URL
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1];
    const publicId = `products/${filename.split('.')[0]}`;
    
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary
};
