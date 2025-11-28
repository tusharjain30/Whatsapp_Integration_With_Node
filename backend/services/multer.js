const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const detectMediaType = (mimetype) => {
    if (mimetype.startsWith("image")) return "images";
    if (mimetype.startsWith("video")) return "videos";
    if (mimetype.startsWith("audio")) return "audio";
    return "documents";
};

const getWhatsappStorage = () =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            try {

                const { category } = req.body;

                if (!category) return cb(new Error("Category is required"));

                let base = path.join(__dirname, "../public/uploads/whatsapp");

                const mediaType = detectMediaType(file.mimetype);

                let uploadPath;

                if (category === "inbound") {
                    uploadPath = path.join(base, `inbound/${mediaType}`);
                } else if (category === "outbound") {
                    uploadPath = path.join(base, `outbound/${mediaType}`);
                } else if (category === "templates") {
                    uploadPath = path.join(base, "templates");
                } else if (category === "campaign") {
                    uploadPath = path.join(base, "campaign");
                } else if (category === "chatbot") {
                    uploadPath = path.join(base, "chatbot");
                } else {
                    uploadPath = path.join(__dirname, "../public/uploads/others");
                }

                if (!uploadPath) {
                    return cb(new Error("Failed to resolve upload path"));
                }

                // create folder if missing
                fs.mkdirSync(uploadPath, { recursive: true });
                return cb(null, uploadPath);

            } catch (error) {
                cb(error);
            }
        },

        filename: (req, file, cb) => {
            const uniqueName = uuidv4() + path.extname(file.originalname);
            cb(null, uniqueName);
        }
    });

// Upload Instance
const uploadWhatsappMedia = multer({
    storage: getWhatsappStorage(),
    limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
});

module.exports = { uploadWhatsappMedia };