import { useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import EmojiPicker from 'emoji-picker-react';
import { FaSmile } from 'react-icons/fa';

const AirdropForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    token: '',
    criteria: '',
    startDate: '',
    status: 'upcoming',
    costType: 'free', // 'free' or 'paid'
    link: '',
    claimUrl: '', // URL for claiming rewards
    logoUrl: '',
    cardColor: '', // Custom hex color code
    predefinedColor: 'default', // Selected from predefined colors
    skipTelegramNotification: false, // Skip Telegram notification
    socialLinks: {
      website: '',
      discord: '',
      twitter: '',
      telegram: '',
      github: '',
      instagram: '',
    },
  });

  // State for emoji pickers
  const [showDescriptionEmojiPicker, setShowDescriptionEmojiPicker] = useState(false);
  const [showCriteriaEmojiPicker, setShowCriteriaEmojiPicker] = useState(false);

  // Refs for emoji pickers
  const descriptionEmojiPickerRef = useRef(null);
  const criteriaEmojiPickerRef = useRef(null);

  // Close emoji pickers when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (descriptionEmojiPickerRef.current && !descriptionEmojiPickerRef.current.contains(event.target)) {
        setShowDescriptionEmojiPicker(false);
      }
      if (criteriaEmojiPickerRef.current && !criteriaEmojiPickerRef.current.contains(event.target)) {
        setShowCriteriaEmojiPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Predefined color options
  const colorOptions = [
    { value: 'default', label: 'Default', color: '#ffffff' },
    { value: 'blue', label: 'Blue', color: '#3b82f6' },
    { value: 'green', label: 'Green', color: '#10b981' },
    { value: 'red', label: 'Red', color: '#ef4444' },
    { value: 'purple', label: 'Purple', color: '#8b5cf6' },
    { value: 'yellow', label: 'Yellow', color: '#f59e0b' },
    { value: 'pink', label: 'Pink', color: '#ec4899' },
    { value: 'indigo', label: 'Indigo', color: '#6366f1' },
    { value: 'gray', label: 'Gray', color: '#6b7280' },
  ];

  // If initialData is provided, use it to populate the form (for editing)
  useEffect(() => {
    if (initialData) {
      // Format the dates to YYYY-MM-DD for the input fields
      const formattedDeadline = initialData.deadline
        ? new Date(initialData.deadline).toISOString().split('T')[0]
        : '';

      const formattedStartDate = initialData.startDate
        ? new Date(initialData.startDate).toISOString().split('T')[0]
        : '';

      // Ensure socialLinks is properly structured
      const socialLinks = {
        website: initialData.socialLinks?.website || '',
        discord: initialData.socialLinks?.discord || '',
        twitter: initialData.socialLinks?.twitter || '',
        telegram: initialData.socialLinks?.telegram || '',
        github: initialData.socialLinks?.github || '',
        instagram: initialData.socialLinks?.instagram || '',
      };

      console.log('Initializing form with social links:', socialLinks);

      setFormData({
        ...initialData,
        deadline: formattedDeadline,
        startDate: formattedStartDate,
        socialLinks: socialLinks,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle social links (they have names like 'social-discord', 'social-twitter', etc.)
    if (name.startsWith('social-')) {
      const socialPlatform = name.split('-')[1];
      console.log(`Setting social link ${socialPlatform} to:`, value);

      // Create a new socialLinks object with all properties explicitly defined
      const updatedSocialLinks = {
        ...formData.socialLinks, // Keep existing values
        [socialPlatform]: value  // Update the specific platform
      };

      console.log('Updated social links:', JSON.stringify(updatedSocialLinks));

      // Update the form data with the new social links object
      setFormData(prevState => {
        const newState = {
          ...prevState,
          socialLinks: updatedSocialLinks
        };
        console.log('New form state socialLinks:', JSON.stringify(newState.socialLinks));
        return newState;
      });

      return; // Exit early to avoid the other conditions
    }
    // Special handling for cardColor to ensure it starts with #
    else if (name === 'cardColor' && value && !value.startsWith('#')) {
      setFormData((prev) => ({
        ...prev,
        [name]: `#${value}`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle emoji selection for description
  const handleDescriptionEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const cursorPosition = document.getElementById('description').selectionStart;
    const text = formData.description;
    const newText = text.slice(0, cursorPosition) + emoji + text.slice(cursorPosition);

    setFormData({
      ...formData,
      description: newText
    });
    setShowDescriptionEmojiPicker(false);
  };

  // Handle emoji selection for criteria
  const handleCriteriaEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const cursorPosition = document.getElementById('criteria').selectionStart;
    const text = formData.criteria;
    const newText = text.slice(0, cursorPosition) + emoji + text.slice(cursorPosition);

    setFormData({
      ...formData,
      criteria: newText
    });
    setShowCriteriaEmojiPicker(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure social links are properly structured
    const cleanedSocialLinks = {
      website: formData.socialLinks?.website || '',
      discord: formData.socialLinks?.discord || '',
      twitter: formData.socialLinks?.twitter || '',
      telegram: formData.socialLinks?.telegram || '',
      github: formData.socialLinks?.github || '',
      instagram: formData.socialLinks?.instagram || ''
    };

    // Create a clean submission object with all required fields
    const submissionData = {
      ...formData,
      socialLinks: cleanedSocialLinks
    };

    console.log('Submitting form data:', submissionData);
    console.log('Card color:', submissionData.cardColor);
    console.log('Predefined color:', submissionData.predefinedColor);
    console.log('Social Links:', JSON.stringify(submissionData.socialLinks));
    console.log('Claim URL:', submissionData.claimUrl);

    // Check if any social links are non-empty
    const hasSocialLinks = Object.values(cleanedSocialLinks).some(link => link && link.trim() !== '');
    console.log('Has social links:', hasSocialLinks);

    // Log each social link for debugging
    Object.entries(cleanedSocialLinks).forEach(([platform, url]) => {
      console.log(`Social link ${platform}:`, url);
    });

    // Validate claim URL if status is 'claim'
    if (formData.status === 'claim' && (!formData.claimUrl || formData.claimUrl.trim() === '')) {
      alert('Claim URL is required when status is set to "Claim"');
      return;
    }

    // Submit the cleaned data
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
        />
      </div>

      <div>
        <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Token
        </label>
        <input
          type="text"
          id="token"
          name="token"
          value={formData.token}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <div className="relative">
          <TextareaAutosize
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            minRows={3}
            className="mt-1 block w-full rounded-md border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
          />
          <button
            type="button"
            className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowDescriptionEmojiPicker(!showDescriptionEmojiPicker)}
          >
            <FaSmile size={20} />
          </button>

          {showDescriptionEmojiPicker && (
            <div
              ref={descriptionEmojiPickerRef}
              className="fixed z-[9999] emoji-picker-container"
              style={{
                right: '20px',
                top: '200px'
              }}
            >
              <EmojiPicker
                onEmojiClick={handleDescriptionEmojiClick}
                searchPlaceholder="Search crypto emojis..."
                previewConfig={{ showPreview: false }}
                categories={['suggested', 'symbols', 'objects']}
                height={220}
                width={220}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="criteria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Criteria
        </label>
        <div className="relative">
          <TextareaAutosize
            id="criteria"
            name="criteria"
            value={formData.criteria}
            onChange={handleChange}
            required
            minRows={2}
            className="mt-1 block w-full rounded-md border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
          />
          <button
            type="button"
            className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowCriteriaEmojiPicker(!showCriteriaEmojiPicker)}
          >
            <FaSmile size={20} />
          </button>

          {showCriteriaEmojiPicker && (
            <div
              ref={criteriaEmojiPickerRef}
              className="fixed z-[9999] emoji-picker-container"
              style={{
                right: '20px',
                top: '200px'
              }}
            >
              <EmojiPicker
                onEmojiClick={handleCriteriaEmojiClick}
                searchPlaceholder="Search crypto emojis..."
                previewConfig={{ showPreview: false }}
                categories={['suggested', 'symbols', 'objects']}
                height={220}
                width={220}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Start
        </label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
        >
          <option value="upcoming">Upcoming</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
          <option value="claim">Claim (Requires Claim URL)</option>
        </select>
        {formData.status === 'claim' && (
          <p className="mt-1 text-xs text-red-500">Note: "Claim" status requires a valid Claim URL below</p>
        )}
      </div>

      <div className="flex items-center mt-4">
        <input
          type="checkbox"
          id="skipTelegramNotification"
          name="skipTelegramNotification"
          checked={formData.skipTelegramNotification}
          onChange={(e) => setFormData({ ...formData, skipTelegramNotification: e.target.checked })}
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="skipTelegramNotification" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Skip Telegram Notification
        </label>
      </div>

      <div>
        <label htmlFor="costType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Cost Type
        </label>
        <select
          id="costType"
          name="costType"
          value={formData.costType}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
        >
          <option value="free">Free</option>
          <option value="paid">Paid ($ Required)</option>
        </select>
      </div>

      <div>
        <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Project Link
        </label>
        <input
          type="url"
          id="link"
          name="link"
          value={formData.link}
          onChange={handleChange}
          required
          placeholder="https://example.com"
          className="mt-1 block w-full rounded-md border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Main website or information page for the project</p>
      </div>

      <div>
        <label htmlFor="claimUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Claim URL {formData.status === 'claim' && <span className="text-red-500">*</span>}
        </label>
        <input
          type="url"
          id="claimUrl"
          name="claimUrl"
          value={formData.claimUrl}
          onChange={handleChange}
          required={formData.status === 'claim'}
          placeholder="https://example.com/claim"
          className="mt-1 block w-full rounded-md border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Direct link to claim rewards (required if status is "Claim")</p>
      </div>

      <div>
        <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Logo URL (optional)
        </label>
        <input
          type="url"
          id="logoUrl"
          name="logoUrl"
          value={formData.logoUrl}
          onChange={handleChange}
          placeholder="https://example.com/logo.png"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
        />
      </div>

      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Social Media Links (Optional)</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add any relevant social media links for the project. All fields are optional.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="social-website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Website URL <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              id="social-website"
              name="social-website"
              value={formData.socialLinks.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
            />
          </div>

          <div>
            <label htmlFor="social-discord" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Discord Invite <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              id="social-discord"
              name="social-discord"
              value={formData.socialLinks.discord}
              onChange={handleChange}
              placeholder="https://discord.gg/invite"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
            />
          </div>

          <div>
            <label htmlFor="social-twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Twitter/X URL <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              id="social-twitter"
              name="social-twitter"
              value={formData.socialLinks.twitter}
              onChange={handleChange}
              placeholder="https://x.com/username"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
            />
          </div>

          <div>
            <label htmlFor="social-telegram" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Telegram URL <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              id="social-telegram"
              name="social-telegram"
              value={formData.socialLinks.telegram}
              onChange={handleChange}
              placeholder="https://t.me/username"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
            />
          </div>

          <div>
            <label htmlFor="social-github" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              GitHub URL <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              id="social-github"
              name="social-github"
              value={formData.socialLinks.github}
              onChange={handleChange}
              placeholder="https://github.com/username"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
            />
          </div>

          <div>
            <label htmlFor="social-instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Instagram URL <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              id="social-instagram"
              name="social-instagram"
              value={formData.socialLinks.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/username"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Card Appearance</h3>

        <div>
          <label htmlFor="predefinedColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Card Color
          </label>
          <select
            id="predefinedColor"
            name="predefinedColor"
            value={formData.predefinedColor}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
          >
            {colorOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="mt-2 flex flex-wrap gap-2">
            {colorOptions.map(option => (
              <div
                key={option.value}
                className={`w-8 h-8 rounded-full cursor-pointer border-2 ${formData.predefinedColor === option.value ? 'border-blue-500 dark:border-blue-400' : 'border-gray-300 dark:border-gray-600'}`}
                style={{ backgroundColor: option.color }}
                onClick={() => setFormData({...formData, predefinedColor: option.value})}
                title={option.label}
              />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="cardColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Custom Card Color (Hex Code)
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="text"
              id="cardColor"
              name="cardColor"
              value={formData.cardColor}
              onChange={handleChange}
              placeholder="#FF5733"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              title="Enter a valid hex color code (e.g., #FF5733)"
              className="block w-full rounded-md border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base"
            />
            {formData.cardColor && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(formData.cardColor) && (
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: formData.cardColor }}
              />
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter a hex color code (e.g., #FF5733) or leave blank to use the selected color above.
          </p>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData ? 'Update Airdrop' : 'Create Airdrop'}
        </button>
      </div>
    </form>
  );
};

export default AirdropForm;
