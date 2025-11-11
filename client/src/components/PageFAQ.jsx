import { useState } from 'react';
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

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className={`mt-8 mb-6 ${className}`}>
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--macos-text)] mb-4">{title}</h2>

      <div className="space-y-3">
        {questions.map((item, index) => (
          <div
            key={index}
            className="macos-card overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:ring-2 focus:ring-[var(--macos-primary)] focus:ring-opacity-50"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="font-medium text-[var(--macos-text)]">{item.question}</span>
              <span className="text-[var(--macos-text-secondary)] ml-2">
                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </button>

            {openIndex === index && (
              <div
                id={`faq-answer-${index}`}
                className="p-4 pt-0 text-[var(--macos-text-secondary)] faq-answer"
              >
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
