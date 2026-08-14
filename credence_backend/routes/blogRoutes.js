const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const auth = require("../middleware/authMiddleware");
const Blog = require("../models/Blog");

const router = express.Router();

// ===============================
// AWS S3 CONFIG
// ===============================
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// ===============================
// MULTER CONFIG FOR BLOG IMAGES
// ===============================
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only jpg, jpeg, png, gif, webp are allowed"), false);
        }
    }
});

// ===============================
// HELPER: LOG TO CONSOLE
// ===============================
const logToConsole = (type, operation, data) => {
    const timestamp = new Date().toLocaleString("en-IN");
    const colors = {
        INFO: '\x1b[36m',
        SUCCESS: '\x1b[32m',
        WARN: '\x1b[33m',
        ERROR: '\x1b[31m',
        RESET: '\x1b[0m'
    };
    const color = colors[type] || colors.RESET;
    console.log(`${color}[${timestamp}] ${type}: ${operation}${colors.RESET}`, data);
};

// ===============================
// PUBLIC ROUTES (NO AUTH REQUIRED)
// ===============================

// GET ALL BLOGS (Public)
router.get("/", async (req, res) => {
    try {
        logToConsole("INFO", "FETCHING_ALL_BLOGS", { ip: req.ip });

        const blogs = await Blog.find().sort({ createdAt: -1 });

        logToConsole("SUCCESS", "BLOGS_FETCHED_SUCCESSFULLY", {
            totalBlogs: blogs.length
        });

        res.json({
            success: true,
            count: blogs.length,
            blogs
        });
    } catch (error) {
        logToConsole("ERROR", "FETCH_BLOGS_ERROR", {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: "Error fetching blogs",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET SINGLE BLOG BY blogId (Public)
router.get("/:blogId", async (req, res) => {
    try {
        const { blogId } = req.params;

        logToConsole("INFO", "FETCHING_SINGLE_BLOG", { blogId, ip: req.ip });

        // Find by custom blogId (UUID), not MongoDB _id
        const blog = await Blog.findOne({ blogId });

        if (!blog) {
            logToConsole("WARN", "BLOG_NOT_FOUND", { blogId });
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        logToConsole("SUCCESS", "BLOG_FETCHED_SUCCESSFULLY", {
            blogId: blog.blogId,
            title: blog.title
        });

        res.json({
            success: true,
            blog
        });
    } catch (error) {
        logToConsole("ERROR", "FETCH_SINGLE_BLOG_ERROR", {
            error: error.message,
            stack: error.stack,
            blogId: req.params.blogId
        });
        res.status(500).json({
            success: false,
            message: "Error fetching blog",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ===============================
// ADMIN ROUTES (AUTH REQUIRED)
// ===============================

// UPLOAD BLOG IMAGE TO S3 (Admin only)
// ✅ UPDATED: Added imageType parameter for cover/main image validation
router.post("/upload-image", auth, upload.single("image"), async (req, res) => {
    try {
        const { imageType } = req.body; // ✅ NEW: "cover" or "main"

        logToConsole("INFO", "BLOG_IMAGE_UPLOAD_REQUEST", {
            adminId: req.user?.adminId || req.user?.id,
            adminName: req.user?.name,
            imageType,
            hasFile: !!req.file,
            contentType: req.file?.mimetype,
            fileSize: req.file?.size
        });

        if (!req.file) {
            logToConsole("WARN", "NO_IMAGE_FILE_PROVIDED", {
                adminId: req.user?.adminId || req.user?.id
            });
            return res.status(400).json({
                success: false,
                message: "No image file provided"
            });
        }

        // ✅ NEW: COVER IMAGE SIZE VALIDATION - 270KB LIMIT
        if (imageType === "cover" && req.file.size > 270 * 1024) {
            logToConsole("WARN", "COVER_IMAGE_SIZE_EXCEEDS_LIMIT", {
                fileSize: req.file.size,
                maxSize: "270KB"
            });
            return res.status(400).json({
                success: false,
                message: "Cover image only allows less than 270KB only"
            });
        }

        // ✅ CHECK MAIN IMAGE SIZE (5MB limit from multer)
        if (imageType === "main" && req.file.size > 5 * 1024 * 1024) {
            logToConsole("WARN", "MAIN_IMAGE_SIZE_EXCEEDS_LIMIT", {
                fileSize: req.file.size,
                maxSize: "5MB"
            });
            return res.status(400).json({
                success: false,
                message: "Main image size exceeds 5MB limit"
            });
        }

        const fileExt = req.file.originalname.split(".").pop();
        const key = `blogs/${uuidv4()}.${fileExt}`;

        logToConsole("INFO", "UPLOADING_TO_S3", { key, bucket: process.env.AWS_BUCKET });

        await s3.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }));

        const imageUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        logToConsole("SUCCESS", "BLOG_IMAGE_UPLOADED_TO_S3", {
            adminId: req.user?.adminId || req.user?.id,
            imageType,
            imageUrl,
            key,
            fileSize: req.file.size
        });

        res.json({
            success: true,
            message: "Image uploaded successfully",
            imageUrl,
            key,
            imageType
        });
    } catch (error) {
        logToConsole("ERROR", "BLOG_IMAGE_UPLOAD_ERROR", {
            error: error.message,
            stack: error.stack,
            adminId: req.user?.adminId || req.user?.id
        });
        res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// CREATE NEW BLOG (Admin only)
// ✅ UPDATED: Added mainImage field
router.post("/", auth, async (req, res) => {
    try {
        const { title, date, time, category, coverImage, mainImage, content } = req.body; // ✅ ADDED mainImage

        logToConsole("INFO", "CREATE_BLOG_REQUEST", {
            adminId: req.user?.adminId || req.user?.id,
            adminName: req.user?.name,
            title,
            hasCoverImage: !!coverImage,
            hasMainImage: !!mainImage,
            hasContent: !!content,
            contentLength: content?.length
        });

        const missingFields = [];
        if (!title) missingFields.push("title");
        if (!date) missingFields.push("date");
        if (!time) missingFields.push("time");
        if (!category) missingFields.push("category");
        if (!coverImage) missingFields.push("coverImage");
        if (!content || content.length === 0) missingFields.push("content");

        if (missingFields.length > 0) {
            logToConsole("WARN", "CREATE_BLOG_MISSING_FIELDS", {
                adminId: req.user?.adminId || req.user?.id,
                missingFields
            });
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`,
                missingFields
            });
        }

        const invalidContentBlocks = content.filter(block => !block.text || block.text.trim() === "");
        if (invalidContentBlocks.length > 0) {
            logToConsole("WARN", "CREATE_BLOG_EMPTY_CONTENT_BLOCKS", {
                adminId: req.user?.adminId || req.user?.id,
                emptyBlocksCount: invalidContentBlocks.length
            });
            return res.status(400).json({
                success: false,
                message: "All content paragraphs must have text",
                emptyBlocksCount: invalidContentBlocks.length
            });
        }

        // blogId will be auto-generated by schema default (uuid)
        const blog = new Blog({
            title: title.trim(),
            date,
            time,
            category: category.trim(),
            coverImage,
            mainImage: mainImage || null, // ✅ ADDED mainImage (optional)
            content: content.map(block => ({
                type: "paragraph",
                text: block.text.trim(),
                underline: block.underline || null,
                html: block.html || null
            })),
            createdBy: req.user?.adminId || req.user?.id,
            createdByName: req.user?.name || "Admin"
        });

        await blog.save();

        logToConsole("SUCCESS", "BLOG_CREATED_SUCCESSFULLY", {
            blogId: blog.blogId,
            title: blog.title,
            adminId: req.user?.adminId || req.user?.id,
            adminName: req.user?.name,
            hasMainImage: !!blog.mainImage,
            contentBlocksCount: blog.content.length
        });

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            blog
        });
    } catch (error) {
        logToConsole("ERROR", "CREATE_BLOG_ERROR", {
            error: error.message,
            stack: error.stack,
            adminId: req.user?.adminId || req.user?.id
        });

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Duplicate blog entry. Blog ID already exists."
            });
        }

        res.status(500).json({
            success: false,
            message: "Error creating blog",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// UPDATE BLOG BY blogId (Admin only)
// ✅ UPDATED: Added mainImage field
router.put("/:blogId", auth, async (req, res) => {
    try {
        const { blogId } = req.params;
        const { title, date, time, category, coverImage, mainImage, content } = req.body; // ✅ ADDED mainImage

        logToConsole("INFO", "UPDATE_BLOG_REQUEST", {
            blogId,
            adminId: req.user?.adminId || req.user?.id,
            adminName: req.user?.name,
            title,
            hasCoverImage: !!coverImage,
            hasMainImage: !!mainImage
        });

        const blog = await Blog.findOne({ blogId });

        if (!blog) {
            logToConsole("WARN", "UPDATE_BLOG_NOT_FOUND", { blogId });
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        const missingFields = [];
        if (!title) missingFields.push("title");
        if (!date) missingFields.push("date");
        if (!time) missingFields.push("time");
        if (!category) missingFields.push("category");
        if (!coverImage) missingFields.push("coverImage");
        if (!content || content.length === 0) missingFields.push("content");

        if (missingFields.length > 0) {
            logToConsole("WARN", "UPDATE_BLOG_MISSING_FIELDS", {
                blogId,
                adminId: req.user?.adminId || req.user?.id,
                missingFields
            });
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`,
                missingFields
            });
        }

        blog.title = title.trim();
        blog.date = date;
        blog.time = time;
        blog.category = category.trim();
        blog.coverImage = coverImage;
        blog.mainImage = mainImage || null; // ✅ ADDED mainImage update
        blog.content = content.map(block => ({
            type: "paragraph",
            text: block.text.trim(),
            underline: block.underline || null,
            html: block.html || null
        }));
        blog.updatedAt = new Date();

        await blog.save();

        logToConsole("SUCCESS", "BLOG_UPDATED_SUCCESSFULLY", {
            blogId: blog.blogId,
            title: blog.title,
            adminId: req.user?.adminId || req.user?.id,
            hasMainImage: !!blog.mainImage,
            contentBlocksCount: blog.content.length
        });

        res.json({
            success: true,
            message: "Blog updated successfully",
            blog
        });
    } catch (error) {
        logToConsole("ERROR", "UPDATE_BLOG_ERROR", {
            error: error.message,
            stack: error.stack,
            blogId: req.params.blogId,
            adminId: req.user?.adminId || req.user?.id
        });
        res.status(500).json({
            success: false,
            message: "Error updating blog",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// DELETE BLOG BY blogId (Admin only)
// ✅ UPDATED: Delete BOTH coverImage AND mainImage from S3
router.delete("/:blogId", auth, async (req, res) => {
    try {
        const { blogId } = req.params;

        logToConsole("INFO", "DELETE_BLOG_REQUEST", {
            blogId,
            adminId: req.user?.adminId || req.user?.id,
            adminName: req.user?.name
        });

        const blog = await Blog.findOne({ blogId });

        if (!blog) {
            logToConsole("WARN", "DELETE_BLOG_NOT_FOUND", { blogId });
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        // ✅ UPDATED: Delete BOTH images from S3 (coverImage AND mainImage)
        const imagesToDelete = [];

        // Add coverImage if exists
        if (blog.coverImage) {
            imagesToDelete.push({ url: blog.coverImage, type: "coverImage" });
        }

        // Add mainImage if exists
        if (blog.mainImage) {
            imagesToDelete.push({ url: blog.mainImage, type: "mainImage" });
        }

        // Delete all images from S3
        for (const image of imagesToDelete) {
            try {
                const urlParts = image.url.split('.amazonaws.com/');
                if (urlParts.length > 1) {
                    const key = urlParts[1];
                    logToConsole("INFO", "DELETING_IMAGE_FROM_S3", { key, blogId, type: image.type });

                    await s3.send(new DeleteObjectCommand({
                        Bucket: process.env.AWS_BUCKET,
                        Key: key
                    }));

                    logToConsole("SUCCESS", "DELETED_IMAGE_FROM_S3", { key, blogId, type: image.type });
                }
            } catch (s3Error) {
                logToConsole("WARN", "S3_DELETE_FAILED", {
                    error: s3Error.message,
                    blogId,
                    imageType: image.type,
                    imageUrl: image.url
                });
            }
        }

        await Blog.findOneAndDelete({ blogId });

        logToConsole("SUCCESS", "BLOG_DELETED_SUCCESSFULLY", {
            blogId,
            title: blog.title,
            adminId: req.user?.adminId || req.user?.id,
            imagesDeleted: imagesToDelete.length
        });

        res.json({
            success: true,
            message: "Blog deleted successfully"
        });
    } catch (error) {
        logToConsole("ERROR", "DELETE_BLOG_ERROR", {
            error: error.message,
            stack: error.stack,
            blogId: req.params.blogId,
            adminId: req.user?.adminId || req.user?.id
        });
        res.status(500).json({
            success: false,
            message: "Error deleting blog",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;