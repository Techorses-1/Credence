import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./BlogSingle.scss";
import img from "../../../assets/Images/cases/img4.png";
import { trackCustomEvent } from "../../../Components/services/metaPixel";
import Navbar from "../../Home/Navbar/Navbar";
import Footer from "../../Home/Footer/Footer";

// Static author (same for all blogs)
const staticAuthor = {
  name: "Piyushbhai Lad",
  designation: "Founder & Managing Director | Business and Immigration Consultant",
  image: img,
  bio: "Founder & Managing Director | Business and Immigration Consultant",
};

// Animation variants
const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 20,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const BlogSingle = () => {
  const { id: blogId } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});

  // ============================================
  // FETCH BLOG FROM API USING blogId
  // ============================================
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);

        if (!blogId) {
          navigate("/blogs");
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs/${blogId}`, {
          credentials: "include"
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Blog not found");
          }
          throw new Error("Failed to fetch blog");
        }

        const data = await response.json();

        if (data.success) {
          setBlog(data.blog);
        } else {
          throw new Error(data.message || "Failed to fetch blog");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      fetchBlog();
    }
  }, [blogId, navigate]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }, []);

  // ============================================
  // ENGAGEMENT TRACKING - Read3Minutes (NEW)
  // Starts a 3-minute timer only once real blog data
  // is loaded. Cancels cleanly if user leaves early.
  // ============================================
  useEffect(() => {
    if (!blog) return; // don't start timer until real content is loaded

    const THREE_MINUTES = 3 * 60 * 1000; // 180000 ms

    const timerId = setTimeout(() => {
      trackCustomEvent("Read3Minutes", {
        blog_id: blog.blogId,
        blog_title: blog.title,
      });
    }, THREE_MINUTES);

    // cleanup - cancels the timer if user navigates away
    // (or blog changes) before 3 minutes are up
    return () => clearTimeout(timerId);
  }, [blog]);

  // ============================================
  // SHARE FUNCTION - NEW
  // ============================================
  const handleShare = async () => {
    if (!blog) return;

    const shareUrl = `${window.location.origin}/cases/${blog.blogId}`;
    const shareTitle = blog.title;

    // Create description with 20 words only
    let description = '';
    if (blog.description) {
      const descText = blog.description;
      const words = descText.split(' ');
      const previewWords = words.slice(0, 30).join(' '); // Changed from 25 to 20
      description = previewWords + (words.length > 30 ? '...' : ''); // Changed from 25 to 20
    } else if (blog.content && blog.content.length > 0) {
      const firstContent = blog.content.find(item => item.text);
      if (firstContent) {
        const words = firstContent.text.split(' ');
        const previewWords = words.slice(0, 30).join(' '); // Changed from 25 to 20
        description = previewWords + (words.length > 30 ? '...' : ''); // Changed from 25 to 20
      }
    }

    // Format: Only one URL with "Read more:" text
    const shareText = `Check out our successful cases : ${shareTitle}
${description}
Read more: ${shareUrl}`;

    // Mobile - Native Share
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText
        });
        toast.success('✅ Shared successfully!', {
          position: "top-center",
          autoClose: 3000,
          closeButton: true,
          draggable: false,
          pauseOnHover: false,
          style: { zIndex: 10001 }
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share error:', error);
          toast.error('Failed to share', {
            position: "top-center",
            autoClose: 3000,
            closeButton: true,
            draggable: false,
            pauseOnHover: false,
            style: { zIndex: 10001 }
          });
        }
      }
    }
    // Desktop - Copy to clipboard
    else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('📋 Message with link copied to clipboard!\n\nYou can now paste it anywhere.', {
          position: "top-center",
          autoClose: 4000,
          closeButton: true,
          draggable: false,
          pauseOnHover: false,
          style: { zIndex: 10001 }
        });
      } catch (error) {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = shareText;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          toast.success('📋 Message with link copied to clipboard!', {
            position: "top-center",
            autoClose: 4000,
            closeButton: true,
            draggable: false,
            pauseOnHover: false,
            style: { zIndex: 10001 }
          });
        } catch (fallbackError) {
          console.error('Fallback copy error:', fallbackError);
          toast.error('Unable to copy. Please copy manually.', {
            position: "top-center",
            autoClose: 3000,
            closeButton: true,
            draggable: false,
            pauseOnHover: false,
            style: { zIndex: 10001 }
          });
        }
      }
    }
  };

  // ============================================
  // VALIDATE FORM
  // ============================================
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  // ============================================
  // HANDLE FORM SUBMIT TO BACKEND
  // ============================================
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      toast.error("Please fill all required fields correctly", {
        position: "top-center",
        autoClose: 3000,
        closeButton: true,
        draggable: false,
        pauseOnHover: false,
        style: { zIndex: 10001 }
      });
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Sending your message...", {
      position: "top-center",
      style: { zIndex: 10001 }
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/blog-contact/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
          blogId: blog.blogId,
          blogTitle: blog.title
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.update(toastId, {
          render: "✅ Message sent successfully! We'll contact you soon.",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
          style: { zIndex: 10001, background: "#7cd64b", color: "#000" }
        });

        setTimeout(() => {
          setForm({ name: "", email: "", phone: "", message: "" });
          setErrors({});
          setModalOpen(false);
        }, 2000);
      } else {
        toast.update(toastId, {
          render: data.message || "❌ Failed to send message. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 4000,
          closeButton: true,
          style: { zIndex: 10001 }
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.update(toastId, {
        render: "❌ Network error. Please check your connection and try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
        style: { zIndex: 10001 }
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setTimeout(() => {
      setForm({ name: "", email: "", phone: "", message: "" });
      setErrors({});
    }, 300);
  };

  // ============================================
  // RENDER CONTENT WITH FORMATTING (HTML)
  // ============================================
  const renderParagraph = (item, idx) => {
    if (item.html) {
      return (
        <motion.div
          key={idx}
          className="bs-para"
          variants={fadeUp}
          dangerouslySetInnerHTML={{ __html: item.html }}
        />
      );
    }

    if (!item.underline) {
      return (
        <motion.p key={idx} className="bs-para" variants={fadeUp}>
          {item.text}
        </motion.p>
      );
    }

    const parts = item.text.split(item.underline);
    return (
      <motion.p key={idx} className="bs-para" variants={fadeUp}>
        {parts[0]}
        <span className="bs-underline">{item.underline}</span>
        {parts[1]}
      </motion.p>
    );
  };

  // Loading state
  if (loading) {
    return (
      <>
        <section className="blog-single">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading blog...</p>
          </div>
        </section>
      </>
    );
  }

  // Error state - redirect to blogs list
  if (error || !blog) {
    navigate("/blogs");
    return null;
  }

  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-center"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <motion.section
        className="blog-single"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      >
        <motion.div className="bs-author" variants={fadeUp}>
          <div className="bs-author-img-wrap">
            <img src={staticAuthor.image} alt={staticAuthor.name} />
          </div>
          <p className="bs-author-name">{staticAuthor.name}</p>
          <p className="bs-author-bio">{staticAuthor.designation}</p>
        </motion.div>

        <motion.h1 className="bs-title" variants={fadeUp}>
          {blog.title}
        </motion.h1>

        <motion.div className="bs-meta" variants={fadeUp}>
          <span className="bs-meta-date">{blog.date}</span>
          <span className="bs-meta-dot">·</span>
          <span className="bs-meta-time">{blog.time}</span>
          <span className="bs-meta-dot">·</span>
          <span className="bs-meta-cat">{blog.category}</span>
        </motion.div>

        <motion.div className="bs-cover" variants={fadeIn}>
          <img src={blog.mainImage} alt="Blog cover" />
        </motion.div>

        <motion.div
          className="bs-content"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {blog.content && blog.content.map((item, idx) => renderParagraph(item, idx))}
        </motion.div>

        {/* ============================================ */}
        {/* UPDATED CTA WRAP WITH SHARE BUTTON - NEW */}
        {/* ============================================ */}
        <motion.div
          className="bs-cta-wrap"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Existing Contact Us Button */}
          <motion.button
            className="bs-cta-btn"
            onClick={() => setModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            Contact Us
          </motion.button>

          {/* 🆕 NEW Share Button */}
          <motion.button
            className="bs-share-btn"
            onClick={handleShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {/* <span className="share-icon">🔗</span> */}
            <span className="share-text">Share</span>
          </motion.button>
        </motion.div>
      </motion.section>

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              className="bs-modal-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleClose}
            />
            <motion.div
              className="bs-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button className="bs-modal-close" onClick={handleClose}>✕</button>
              <>
                <h3 className="bs-modal-title">Get In Touch</h3>
                <p className="bs-modal-sub">Fill in the details below and we'll get back to you shortly.</p>
                <div className="bs-form">
                  <div className="bs-form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={errors.name ? "error" : ""}
                      disabled={submitting}
                    />
                    {errors.name && <span className="bs-err">{errors.name}</span>}
                  </div>
                  <div className="bs-form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={errors.email ? "error" : ""}
                      disabled={submitting}
                    />
                    {errors.email && <span className="bs-err">{errors.email}</span>}
                  </div>
                  <div className="bs-form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 00000 00000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={errors.phone ? "error" : ""}
                      disabled={submitting}
                    />
                    {errors.phone && <span className="bs-err">{errors.phone}</span>}
                  </div>
                  <div className="bs-form-group">
                    <label>Message</label>
                    <textarea
                      placeholder="Write your message here..."
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={errors.message ? "error" : ""}
                      disabled={submitting}
                    />
                    {errors.message && <span className="bs-err">{errors.message}</span>}
                  </div>
                  <motion.button
                    className="bs-modal-submit"
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={submitting}
                    style={{ opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? "SENDING..." : "SUBMIT"}
                  </motion.button>
                </div>
              </>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Footer />
    </>
  );
};

export default BlogSingle;