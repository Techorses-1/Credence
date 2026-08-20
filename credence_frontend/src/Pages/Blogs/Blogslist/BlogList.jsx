import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./BlogList.scss";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // FETCH BLOGS FROM API
  // ============================================
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs`, {
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }

        const data = await response.json();

        if (data.success) {
          setBlogs(data.blogs);
        } else {
          throw new Error(data.message || "Failed to fetch blogs");
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // ============================================
  // EXTRACT SHORT DESCRIPTION FROM CONTENT WITH FORMATTING
  // ============================================
  const getShortDescription = (content) => {
    if (!content || content.length === 0) return "No description available";

    const firstBlock = content[0];
    let description = "";
    let isHtml = false;

    if (firstBlock.html && firstBlock.html.trim()) {
      description = firstBlock.html;
      isHtml = true;
    } else if (firstBlock.text) {
      description = firstBlock.text;
      isHtml = false;
    }

    // Strip HTML to get plain text for length check
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    const plainText = tempDiv.innerText || description;

    // Trim to 120 characters
    if (plainText.length > 120) {
      if (isHtml) {
        // For HTML content, truncate while preserving HTML structure
        const truncatedPlain = plainText.substring(0, 120) + '...';
        const truncatedHtml = description.replace(plainText, truncatedPlain);
        return { __html: truncatedHtml, isHtml: true };
      } else {
        return { __html: plainText.substring(0, 120) + '...', isHtml: false };
      }
    }

    if (isHtml) {
      return { __html: description, isHtml: true };
    }
    return { __html: description, isHtml: false };
  };

  // Loading state
  if (loading) {
    return (
      <section className="blog-list">
        <div className="blog-list-container">
          <div className="loading-state">Loading Cases...</div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="blog-list">
        <div className="blog-list-container">
          <div className="error-state">
            <p>Failed to load blogs. Please try again later.</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // No blogs state
  if (blogs.length === 0) {
    return (
      <section className="blog-list">
        <div className="blog-list-container">
          <div className="empty-state">
            <p>No blogs available yet. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="blog-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="blog-list-container">
        <div className="blog-grid">
          {blogs.map((blog) => {
            const description = getShortDescription(blog.content);
            return (
              <motion.div
                key={blog.blogId}
                className="blog-card"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Link to={`/appeals/cases/${blog.blogId}`} className="blog-card-link">
                  <div className="blog-card-image-wrapper">
                    <div className="blog-card-image">
                      <img src={blog.mainImage} alt={blog.title} />
                    </div>
                    {/* Category Badge - Top Right Corner */}
                    <span className="blog-card-category-badge">{blog.category}</span>
                  </div>
                  <div className="blog-card-content">
                    <h2 className="blog-card-title">{blog.title}</h2>
                    <div 
                      className="blog-card-description"
                      dangerouslySetInnerHTML={description}
                    />
                    <div className="blog-card-footer">
                      <span className="blog-card-date">{blog.date}</span>
                      <span className="blog-card-readmore">Read More →</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default BlogList;