import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import "./Faq.scss";

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const faqData = [
    {
      question: "Who can use Credence bookkeeping services?",
      answer:
        "Our bookkeeping services are ideal for startups, small businesses, and growing companies looking for reliable financial management.",
    },
    {
      question: "Will my financial data be secure?",
      answer:
        "Yes. We follow strict confidentiality policies and use secure systems to protect all financial data.",
    },
    {
      question: "Can I customize my bookkeeping package?",
      answer:
        "Absolutely. Our services are flexible and can be tailored to match your business requirements.",
    },
    {
      question: "Do you offer tax preparation services?",
      answer:
        "Yes, we provide tax preparation, filing assistance, and compliance support.",
    },
    {
      question: "How frequently will I receive reports?",
      answer:
        "You can receive reports monthly, quarterly, or on a custom schedule.",
    },
  ];

  const toggleFaq = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className="credence-faq-section">
      <h2 className="cf-heading">
        FAQs
        <span className="cf-underline"></span>
      </h2>

      <div className="cf-container">
        {faqData.map((item, index) => (
          <div
            key={index}
            className={`cf-item ${activeIndex === index ? "cf-active" : ""}`}
            onClick={() => toggleFaq(index)}
          >
            <div className="cf-question">
              <span>{item.question}</span>
              <FaChevronDown className="cf-arrow" />
            </div>

            <div className="cf-answer">
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Faq;