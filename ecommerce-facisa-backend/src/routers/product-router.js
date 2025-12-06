import express from "express";
import productController from "../controllers/product-controller.js"; // Importe o novo controller
import adminMiddleware from "../middlewares/admin-middleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ensure upload directory exists
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
		cb(null, name);
	}
});

const upload = multer({ storage });

router.get("/", productController.findAll);
router.post("/", adminMiddleware, upload.single("image"), productController.create);
router.put("/:id", adminMiddleware, upload.single("image"), productController.update);
router.delete("/:id", adminMiddleware, productController.delete);

export default router;