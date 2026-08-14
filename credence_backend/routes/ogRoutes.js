const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");

const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, "").trim() : "");

const escapeHtml = (str = "") =>
    str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

router.get("/cases/:blogId", async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findOne({ blogId });

        if (!blog) {
            return res.redirect("https://jladgroup.fi/blogs");
        }

        let description = "Read this case on JLAD Group.";
        if (blog.content && blog.content.length > 0) {
            const first = blog.content[0];
            const raw = first.html ? stripHtml(first.html) : first.text || "";
            if (raw) description = raw.substring(0, 160);
        }

        const title = "J.Lad Appeals & Residence Permits";
        const desc = escapeHtml(description);
        const image = blog.coverImage;
        const url = `https://jladgroup.fi/cases/${blog.blogId}`;

        res.set("Content-Type", "text/html");
        res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta property="og:title" content="${title}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:secure_url" content="${image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:url" content="${url}" />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />

<meta name="twitter:image" content="${image}" />
<meta http-equiv="refresh" content="0;url=${url}" />
</head>
<body>Redirecting to <a href="${url}">${title}</a>...</body>
</html>`);
    } catch (err) {
        console.error("OG route error:", err);
        res.redirect("https://jladgroup.fi/blogs");
    }
});

module.exports = router;