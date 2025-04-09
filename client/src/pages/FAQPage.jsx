import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import PageFAQ from '../components/PageFAQ';
import { faqData } from '../data/faqData';

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Combine all FAQ categories
  const allFaqs = {
    all: [
      ...faqData.home,
      ...faqData.airdropDetail.filter(
        q => !faqData.home.some(homeQ => homeQ.question === q.question)
      ),
      ...faqData.dashboard.filter(
        q => !faqData.home.some(homeQ => homeQ.question === q.question) && 
             !faqData.airdropDetail.some(detailQ => detailQ.question === q.question)
      )
    ]
  };
  
  // Get the questions for the active category
  const getQuestions = () => {
    if (activeCategory === 'all') {
      return allFaqs.all;
    }
    return faqData[activeCategory] || [];
  };

  return (
    <>
      <SEO
        title="Frequently Asked Questions | Crypto Airdrops | Airdrops.geo"
        description="Find answers to common questions about crypto airdrops, how to claim them, safety tips, and how to use Airdrops.geo to discover the best opportunities."
        canonicalUrl="/faq"
      />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--macos-text)] mb-6 text-center">
          Frequently Asked Questions
        </h1>
        
        <p className="text-[var(--macos-text-secondary)] mb-8 text-center max-w-3xl mx-auto">
          Find answers to common questions about crypto airdrops, how to claim them, and how to use Airdrops.geo to discover the best opportunities.
        </p>
        
        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-md text-sm ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All Questions
          </button>
          <button
            onClick={() => setActiveCategory('home')}
            className={`px-4 py-2 rounded-md text-sm ${
              activeCategory === 'home'
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveCategory('airdropDetail')}
            className={`px-4 py-2 rounded-md text-sm ${
              activeCategory === 'airdropDetail'
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Claiming Airdrops
          </button>
          <button
            onClick={() => setActiveCategory('dashboard')}
            className={`px-4 py-2 rounded-md text-sm ${
              activeCategory === 'dashboard'
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            My Airdrops
          </button>
        </div>
        
        {/* FAQ content */}
        <div className="max-w-4xl mx-auto">
          <PageFAQ
            questions={getQuestions()}
            title={
              activeCategory === 'all' ? 'All Questions' :
              activeCategory === 'home' ? 'General Questions' :
              activeCategory === 'airdropDetail' ? 'Questions About Claiming Airdrops' :
              activeCategory === 'dashboard' ? 'Questions About My Airdrops' :
              'Frequently Asked Questions'
            }
            showMoreLink={false}
          />
        </div>
        
        {/* Back to home button */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium text-sm sm:text-base py-2 px-4 sm:px-6 rounded-md transition-colors shadow-md"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default FAQPage;
