const mongoose = require("mongoose");

const contentBlockSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ["paragraph"], default: "paragraph" },
        text: { type: String, required: true },
        underline: { type: String, default: null },
        html: { type: String, default: null }
    },
    { _id: false }
);

// Helper function to generate random alphanumeric string
function generateRandomString(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Helper function to generate blogId with prefix
function generateBlogId() {
    const randomStr = generateRandomString(6);
    return `blog-${randomStr}`;
}

const blogSchema = new mongoose.Schema(
    {
        blogId: {
            type: String,
            unique: true,
            required: true,
            default: generateBlogId
        },
        title: { type: String, required: true },
        date: { type: String, required: true },
        time: { type: String, required: true },
        category: { type: String, required: true },
        coverImage: { type: String, required: true },
        mainImage: { type: String, required: false }, // ✅ NEW FIELD ADDED
        content: [contentBlockSchema],
        createdBy: { type: String, required: true },
        createdByName: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);


module.exports = mongoose.model("Blog", blogSchema);