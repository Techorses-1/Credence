import React from "react";
import { motion } from "framer-motion";
import "./Services.scss";

const services = [
  {
    no: "01",
    title: "Company Formation in Finland",
    desc: "Set up your Finnish company quickly and correctly. We take care of documentation, registrations, and government formalities so you can start operating without delays.",
  },
  {
    no: "02",
    title: "Branch Registration",
    desc: "Planning to expand your existing foreign company into Finland? We handle the full branch registration process, including legal and tax requirements.",
  },
  {
    no: "03",
    title: "Accounting & Financial",
    desc: "Stay compliant with Finnish accounting standards. Our professional accountants manage bookkeeping, payroll, financial statements, and reporting with accuracy and transparency.",
  },
  {
    no: "04",
    title: "Tax & VAT Registration",
    desc: "Avoid costly mistakes and start your business legally from day one. We manage all required tax registrations with the Finnish authorities.",
  },
  {
    no: "05",
    title: "Virtual Office & Legal Address",
    desc: "Get a prestigious Helsinki business address without high overhead costs. Our virtual office includes digital mail handling and a legally compliant registered address.",
  },
  {
    no: "06",
    title: "Company Closure & Deregistration",
    desc: "If your business plans change, we ensure a smooth and fully compliant company liquidation process.",
  },
];

const Services = () => {
  // Header animation variants
  const headerVariants = {
    hidden: { y: -30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.8
      }
    }
  };

  const underlineVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  const subtitleVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.4
      }
    }
  };

  const descriptionVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.6
      }
    }
  };

  // Grid container variants - FIXED for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  // Service item variants - appearing one by one
  const itemVariants = {
    hidden: {
      y: 30,
      opacity: 0,
      scale: 0.9
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  };

  // Hover variants for service items
  const hoverVariants = {
    hover: {
      scale: 1.03,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    },
    tap: {
      scale: 0.97
    }
  };

  // Number animation variants
  const numberVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 12,
        delay: 0.1
      }
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <motion.section
      className="services"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Heading Section */}
      <motion.div
        className="services-header"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 variants={headerVariants}>
          Services
        </motion.h2>

        <motion.span
          className="underline"
          variants={underlineVariants}
        />

        <motion.h4 variants={subtitleVariants}>
          Complete Business Setup & Financial Services in Finland
        </motion.h4>

        <motion.p variants={descriptionVariants}>
          We offer end-to-end business support tailored for local and foreign entrepreneurs in Finland.
        </motion.p>
      </motion.div>

      {/* Services Grid - Now with proper staggered animation */}
      <motion.div
        className="services-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {services.map((item, index) => (
          <motion.div
            className="service-item"
            key={item.no}
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
            custom={index}
          >
            <motion.div
              className="number"
              variants={numberVariants}
            >
              {item.no}
            </motion.div>

            <div className="content">
              <h5>{item.title}</h5> 
              <p>{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default Services;