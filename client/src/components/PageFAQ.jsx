import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

/**
 * Reusable FAQ component that can be added to any page.
 */
const PageFAQ = ({
  questions = [],
  title = 'Frequently Asked Questions',
  showMoreLink = true,
  className = ''
}) => {
  const [openIndex, setOpenIndex] = useState(null);
  const reactId = useId().replace(/:/g, '');
  const faqId = `faq-${reactId}`;

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <section id={faqId} className={`faq-container mt-8 mb-6 ${className}`} aria-labelledby={`${faqId}-title`}>
      <h2 id={`${faqId}-title`} className="text-xl sm:text-2xl font-bold text-[var(--macos-text)] mb-4">
        {title}
      </h2>

      <div className="space-y-3">
        {questions.map((item, index) => {
          const isOpen = openIndex === index;
          const questionId = `${faqId}-question-${index}`;
          const answerId = `${faqId}-answer-${index}`;

          return (
            <div
              key={`${item.question}-${index}`}
              className="faq-item overflow-hidden rounded-lg bg-[var(--macos-card-bg)] transition-colors duration-200"
            >
              <button
                id={questionId}
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left text-[var(--macos-text)] transition-colors hover:bg-[var(--macos-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--macos-primary)]"
                aria-expanded={isOpen}
                aria-controls={answerId}
              >
                <span className="min-w-0 font-medium">{item.question}</span>
                <span className="shrink-0 text-[var(--macos-text-secondary)]" aria-hidden="true">
                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>

              {isOpen && (
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  className="faq-answer px-4 pb-4 text-left text-[var(--macos-text-secondary)]"
                >
                  {typeof item.answer === 'string' ? (
                    <p className="mb-0">{item.answer}</p>
                  ) : (
                    item.answer
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showMoreLink && (
        <div className="mt-4 text-center">
          <Link
            to="/faq"
            className="text-sm font-medium text-[var(--macos-primary)] hover:text-[var(--macos-primary-hover)]"
          >
            View all frequently asked questions
          </Link>
        </div>
      )}
    </section>
  );
};

export default PageFAQ;
