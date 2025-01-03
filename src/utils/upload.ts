// import multer from "multer";
// import path from "path";

// // Configure storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(process.cwd(), "public/uploads")); // Directory to store images
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// // File filter for validating images
// const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only images are allowed!") as never, false);
//   }
// };

// // Configure Multer
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
// });

// export default upload;
