const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadPath = path.join(__dirname,"../uploads");
if (!fs.existsSync(uploadPath)) {fs.mkdirSync(uploadPath, {
        recursive: true
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {cb(null, uploadPath);},
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// Filtro basico para imagenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, WEBP)'), false);
    }
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});