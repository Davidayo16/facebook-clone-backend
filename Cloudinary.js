import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "images", // Specify the folder in Cloudinary where the images will be stored
    allowed_formats: ["jpg", "jpeg", "png"], // Specify the allowed file formats
    transformation: [{ width: 500, height: 500, crop: "limit" }], // You can apply image transformations if needed
  },
});
const upload = multer({ storage: storage });

export { upload, storage };
