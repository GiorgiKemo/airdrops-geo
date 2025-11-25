import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

/**
 * Reusable FAQ component that can be added to any page
 * @param {Object} props
 * @param {Array} props.questions - Array of question objects with question and answer properties
 * @param {string} props.title - Title for the FAQ section
 * @param {boolean} props.showMoreLink - Whether to show a link to the full FAQ page
 * @param {string} props.className - Additional CSS classes
 */
const PageFAQ = ({
  questions = [],
  title = "Frequently Asked Questions",
  showMoreLink = true,
  className = ""
}) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqId] = useState(`faq-${Math.random().toString(36).substring(2, 9)}`);

  // Use direct DOM manipulation to remove any blue lines
  useEffect(() => {
    // Function to remove blue lines
    const removeBlueLines = () => {
      // Target the specific FAQ container
      const faqContainer = document.getElementById(faqId);
      if (!faqContainer) return;

      // Find all potential elements that might have blue lines
      const allElements = faqContainer.querySelectorAll('*');

      // Apply styles to remove borders
      allElements.forEach(el => {
        el.style.border = 'none';
        el.style.borderTop = 'none';
        el.style.borderBottom = 'none';
        el.style.borderLeft = 'none';
        el.style.borderRight = 'none';
        el.style.boxShadow = 'none';
      });

      // Add a specific style tag to target any remaining blue lines
      const styleId = `style-${faqId}`;
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          #${faqId} * {
            border: none !important;
            border-top: none !important;
            border-bottom: none !important;
            box-shadow: none !important;
          }
          #${faqId} hr,
          #${faqId} .faq-item::after,
          #${faqId} .faq-item::before,
          #${faqId} .faq-answer::after,
          #${faqId} .faq-answer::before,
          #${faqId} button::after,
          #${faqId} button::before {
            display: none !important;
            border: none !important;
            height: 0 !important;
          }
        `;
        document.head.appendChild(style);
      }
    };

    // Run initially
    removeBlueLines();

    // Run whenever the open index changes
    if (openIndex !== null) {
      setTimeout(removeBlueLines, 50); // Small delay to ensure DOM is updated
    }

    // Cleanup
    return () => {
      const styleId = `style-${faqId}`;
      const styleEl = document.getElementById(styleId);
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, [openIndex, faqId]);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div id={faqId} className={`mt-8 mb-6 ${className} faq-container`}>
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--macos-text)] mb-4">{title}</h2>

      <div className="space-y-3">
        {questions.map((item, index) => (
          <div
            key={index}
            className="macos-card overflow-hidden transition-all duration-200 faq-item no-border no-blue-line"
            style={{
              border: 'none',
              borderTop: 'none',
              borderBottom: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderColor: 'transparent',
              boxShadow: 'none'
            }}
            data-faq-item={`${faqId}-item-${index}`}
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:ring-2 focus:ring-[var(--macos-primary)] focus:ring-opacity-50 border-none no-blue-line"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
              style={{
                border: 'none',
                borderBottom: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                boxShadow: 'none',
                outline: 'none'
              }}
              data-faq-button={`${faqId}-button-${index}`}
            >
              <span className="font-medium text-[var(--macos-text)]">{item.question}</span>
              <span className="text-[var(--macos-text-secondary)] ml-2">
                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </button>

            {openIndex === index && (
              <div
                id={`faq-answer-${index}`}
                className="p-4 pt-0 text-[var(--macos-text-secondary)] faq-answer border-none no-border no-blue-line"
                style={{
                  border: 'none',
                  borderTop: 'none',
                  borderBottom: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderColor: 'transparent',
                  boxShadow: 'none',
                  background: 'transparent',
                  position: 'relative',
                  zIndex: 10
                }}
                data-faq-answer={`${faqId}-answer-${index}`}
              >
                {/* Hidden div to cover any potential blue line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-transparent"
                  style={{ border: 'none', borderTop: 'none' }}
                ></div>
                {typeof item.answer === 'string' ? (
                  <p>{item.answer}</p>
                ) : (
                  item.answer
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showMoreLink && (
        <div className="mt-4 text-center">
          <Link
            to="/faq"
            className="text-[var(--macos-primary)] no-underline hover:underline text-sm font-medium"
          >
            View all frequently asked questions
          </Link>
        </div>
      )}
    </div>
  );
};

export default PageFAQ;
