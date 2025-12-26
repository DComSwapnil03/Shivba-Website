const multer = require('multer');

// Configure storage to keep files in memory (RAM)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.includes('excel') || 
        file.mimetype.includes('spreadsheetml') || 
        file.mimetype.includes('csv') ||
        file.originalname.match(/\.(xlsx|xls|csv)$/)
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only .xlsx, .xls, and .csv files allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB to prevent Vercel timeouts
});

module.exports = upload;