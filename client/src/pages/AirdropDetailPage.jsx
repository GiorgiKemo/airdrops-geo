import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { airdropService } from '../services/api';
import AirdropLogo from '../components/AirdropLogo';
import LogoUpdater from '../components/LogoUpdater';
import AirdropUpdates from '../components/AirdropUpdates';
import AirdropDetailSkeleton from '../components/skeletons/AirdropDetailSkeleton';
import AirdropForm from '../components/AirdropForm';
import AirdropUpdateForm from '../components/AirdropUpdateForm';
import PageFAQ from '../components/PageFAQ';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { faqData } from '../data/faqData';
import { FaGlobe, FaDiscord, FaTwitter, FaTelegram, FaGithub, FaInstagram, FaEdit, FaPen } from 'react-icons/fa';

const AirdropDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [airdrop, setAirdrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const formRef = useRef(null);

  // Function to fetch airdrop details
  const fetchAirdrop = async () => {
    try {
      setLoading(true);
      const data = await airdropService.getAirdropById(id);
      setAirdrop(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch airdrop details. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Function to update airdrop status
  const updateAirdropStatus = async (newStatus) => {
    try {
      // Special handling for 'claim' status
      if (newStatus === 'claim' && !airdrop.claimUrl) {
        setError('Cannot set status to "Claim" without a claim URL. Please edit the airdrop to add a claim URL first.');
        return;
      }

      setLoading(true);
      // Explicitly set skipTelegramNotification to true to prevent Telegram notifications for status changes
      // Use editButton=true parameter to ensure the server treats this as an edit button update
      await airdropService.updateAirdrop(
        id,
        {
          status: newStatus,
          skipTelegramNotification: true,
          sendTelegramNotification: false
        },
        {}, // No special headers
        true // Use editButton=true query parameter
      );
      // Refresh the airdrop data
      await fetchAirdrop();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update airdrop status. Please try again later.');
      console.error('Status update error:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle airdrop update form submission
  const handleUpdateAirdrop = async (updatedData) => {
    try {
      setLoading(true);
      // Ensure skipTelegramNotification is set to true to prevent Telegram notifications
      updatedData.skipTelegramNotification = true;
      updatedData.sendTelegramNotification = false;

      await airdropService.updateAirdrop(id, updatedData);
      setSuccessMessage('Airdrop updated successfully!');
      setIsEditing(false);
      // Refresh the airdrop data
      await fetchAirdrop();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update airdrop. Please try again later.');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle adding an update
  const handleAddUpdate = async (updateContent, skipTelegram) => {
    try {
      setLoading(true);
      await airdropService.addAirdropUpdate(id, updateContent, skipTelegram);
      setSuccessMessage(`Update added successfully! ${skipTelegram ? '(Telegram notification skipped)' : ''}`);
      setIsAddingUpdate(false);
      // Refresh the airdrop data
      await fetchAirdrop();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add update. Please try again later.');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirdrop();
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-600 text-white font-bold';
      case 'upcoming':
        return 'bg-blue-600 text-white font-bold';
      case 'ended':
        return 'bg-gray-600 text-white font-bold';
      case 'claim':
        return 'bg-red-600 text-white font-bold';
      default:
        return 'bg-gray-600 text-white font-bold';
    }
  };

  return (
    <>
      {airdrop && (
        <SEO
          title={`${airdrop.title} (${airdrop.token}) Airdrop | Claim Free ${airdrop.token} Tokens`}
          description={`Learn about the ${airdrop.title} crypto airdrop and how to claim free ${airdrop.token} tokens. ${airdrop.description.substring(0, 120)}...`}
          canonicalUrl={`/airdrops/${id}`}
          type="article"
          keywords={`${airdrop.token} airdrop, ${airdrop.title} crypto, claim ${airdrop.token}, free ${airdrop.token} tokens, cryptocurrency airdrop, ${airdrop.token.toLowerCase()} blockchain, crypto airdrops`}
        >
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": `${airdrop.title} (${airdrop.token}) Airdrop | Claim Free Tokens`,
              "description": `${airdrop.description.substring(0, 150)}...`,
              "image": airdrop.logoUrl || `${window.location.origin}/og-image.jpg`,
              "author": {
                "@type": "Organization",
                "name": "Airdrops.geo",
                "url": window.location.origin
              },
              "publisher": {
                "@type": "Organization",
                "name": "Airdrops.geo",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${window.location.origin}/logo.png`
                }
              },
              "datePublished": airdrop.createdAt || new Date().toISOString(),
              "dateModified": airdrop.updatedAt || new Date().toISOString(),
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": window.location.href
              }
            })}
          </script>
        </SEO>
      )}
      <div className="container mx-auto px-4 py-4 sm:py-8">
      <Link to="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 inline-block text-sm sm:text-base">
        &larr; Back to Airdrops
      </Link>

      {loading ? (
        <div className="mt-4">
          <AirdropDetailSkeleton />
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      ) : airdrop ? (
        <div className="macos-card overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start mb-4 sm:mb-6">
              {/* Logo with track button overlay */}
              <div className="mb-3 sm:mb-0 sm:mr-4">
                <AirdropLogo airdrop={airdrop} size="large" />
              </div>

              <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center sm:items-start gap-2 sm:gap-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--macos-text)]">{airdrop.title}</h1>
                  {airdrop.status === 'claim' ? (
                    <div className="bg-[var(--macos-danger)] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                      CLAIM NOW
                    </div>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                        airdrop.status
                      )}`}
                    >
                      {airdrop.status.charAt(0).toUpperCase() + airdrop.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <p className="text-base sm:text-lg font-semibold text-[var(--macos-text)]">Token: {airdrop.token}</p>
              <p className="text-sm sm:text-base text-[var(--macos-text-secondary)] mt-2">Start: {formatDate(airdrop.startDate)}</p>
            </div>

            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--macos-text)] mb-2">Description</h2>
              <p className="text-sm sm:text-base text-[var(--macos-text-secondary)] whitespace-pre-line break-words">{airdrop.description}</p>
            </div>

            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--macos-text)] mb-2">Criteria</h2>
              <p className="text-sm sm:text-base text-[var(--macos-text-secondary)] whitespace-pre-line break-words">{airdrop.criteria}</p>
            </div>

            {/* Social Media Links */}
            {airdrop.socialLinks && Object.values(airdrop.socialLinks).some(link => link) && (
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--macos-text)] mb-2">Connect</h2>
                <div className="flex flex-wrap gap-4">
                  {airdrop.socialLinks.website && (
                    <a
                      href={airdrop.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)] transition-colors flex items-center gap-2"
                      aria-label="Website"
                    >
                      <FaGlobe size={20} />
                      <span>Website</span>
                    </a>
                  )}
                  {airdrop.socialLinks.discord && (
                    <a
                      href={airdrop.socialLinks.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--macos-text-secondary)] hover:text-[#5865F2] transition-colors flex items-center gap-2"
                      aria-label="Discord"
                    >
                      <FaDiscord size={20} />
                      <span>Discord</span>
                    </a>
                  )}
                  {airdrop.socialLinks.twitter && (
                    <a
                      href={airdrop.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--macos-text-secondary)] hover:text-[#1DA1F2] transition-colors flex items-center gap-2"
                      aria-label="Twitter"
                    >
                      <FaTwitter size={20} />
                      <span>Twitter</span>
                    </a>
                  )}
                  {airdrop.socialLinks.telegram && (
                    <a
                      href={airdrop.socialLinks.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--macos-text-secondary)] hover:text-[#0088cc] transition-colors flex items-center gap-2"
                      aria-label="Telegram"
                    >
                      <FaTelegram size={20} />
                      <span>Telegram</span>
                    </a>
                  )}
                  {airdrop.socialLinks.github && (
                    <a
                      href={airdrop.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--macos-text-secondary)] hover:text-[#333] dark:hover:text-white transition-colors flex items-center gap-2"
                      aria-label="GitHub"
                    >
                      <FaGithub size={20} />
                      <span>GitHub</span>
                    </a>
                  )}
                  {airdrop.socialLinks.instagram && (
                    <a
                      href={airdrop.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--macos-text-secondary)] hover:text-[#E1306C] transition-colors flex items-center gap-2"
                      aria-label="Instagram"
                    >
                      <FaInstagram size={20} />
                      <span>Instagram</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 w-full sm:w-auto">
                {airdrop.status === 'claim' ? (
                  <a
                    href={airdrop.claimUrl || airdrop.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="macos-button bg-[var(--macos-danger)] hover:bg-opacity-90 text-white font-bold text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6 transform hover:-translate-y-1"
                  >
                    Claim Rewards Now
                  </a>
                ) : null}
                <a
                  href={airdrop.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`macos-button ${airdrop.status === 'claim' ? 'bg-[var(--macos-secondary)] hover:bg-opacity-90' : ''} text-white font-bold text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6`}
                >
                  Visit Official Airdrop Page
                </a>
              </div>
              <span className="text-[var(--macos-primary)] font-medium text-sm sm:text-base">
                {airdrop.views || 0} views
              </span>
            </div>

            {/* Updates Section */}
            {airdrop.updates && airdrop.updates.length > 0 && (
              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <AirdropUpdates updates={airdrop.updates} />
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mt-4 p-3 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-md">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 rounded-md">
                {error}
              </div>
            )}

            {/* Admin Tools - Only visible to the admin (you) */}
            {user && user.username === 'admin' && !isEditing && !isAddingUpdate && (
              <div className="space-y-4 mt-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FaEdit /> Edit Airdrop
                  </button>
                  <button
                    onClick={() => setIsAddingUpdate(true)}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <FaPen /> Add Update
                  </button>
                </div>

                <LogoUpdater
                  airdropId={airdrop._id}
                  onUpdate={() => {
                    // Refresh the airdrop data after update
                    fetchAirdrop();
                  }}
                />

                {/* Status Updater */}
                <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">Update Status</h3>
                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                    <button
                      onClick={() => updateAirdropStatus('upcoming')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        airdrop.status === 'upcoming'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-100'
                      }`}
                    >
                      Upcoming
                    </button>
                    <button
                      onClick={() => updateAirdropStatus('active')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        airdrop.status === 'active'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-green-100'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => updateAirdropStatus('ended')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        airdrop.status === 'ended'
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Ended
                    </button>
                    <button
                      onClick={() => updateAirdropStatus('claim')}
                      disabled={!airdrop.claimUrl}
                      title={airdrop.claimUrl ? 'Set status to Claim' : 'Requires a Claim URL - Edit the airdrop first'}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        airdrop.status === 'claim'
                          ? 'bg-red-600 text-white'
                          : !airdrop.claimUrl
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-red-100'
                      }`}
                    >
                      Claim {!airdrop.claimUrl && '(Needs URL)'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Airdrop Form */}
            {isEditing && (
              <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Airdrop</h3>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
                <AirdropForm
                  ref={formRef}
                  initialValues={airdrop}
                  onSubmit={handleUpdateAirdrop}
                  isEdit={true}
                  loading={loading}
                />
              </div>
            )}

            {/* Add Update Form */}
            {isAddingUpdate && (
              <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Update</h3>
                  <button
                    onClick={() => setIsAddingUpdate(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
                <AirdropUpdateForm
                  onSubmit={handleAddUpdate}
                  onCancel={() => setIsAddingUpdate(false)}
                  loading={loading}
                />
              </div>
            )}

            {/* FAQ Section */}
            {!isEditing && !isAddingUpdate && (
              <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <PageFAQ
                  questions={faqData.airdropDetail}
                  title="Frequently Asked Questions About This Airdrop"
                  showMoreLink={true}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Airdrop not found.</p>
        </div>
      )}
    </div>
    </>
  );
};

export default AirdropDetailPage;
