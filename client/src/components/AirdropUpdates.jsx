import PropTypes from 'prop-types';

const AirdropUpdates = ({ updates }) => {
  const safeUpdates = Array.isArray(updates) ? updates : [];

  if (safeUpdates.length === 0) {
    return null;
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (!dateString || Number.isNaN(date.getTime())) {
      return 'Date unavailable';
    }

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString(undefined, options);
  };

  // Sort updates by date (newest first)
  const sortedUpdates = [...safeUpdates].sort((a, b) => {
    const bTime = new Date(b.date).getTime();
    const aTime = new Date(a.date).getTime();

    return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
  });

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Updates
      </h3>
      <div className="space-y-4">
        {sortedUpdates.map((update, index) => (
          <div
            key={update._id || index}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(update.date)}
              </span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {typeof update.content === 'string' && update.content.trim()
                ? update.content
                : 'No update details available.'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

AirdropUpdates.propTypes = {
  updates: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      content: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      telegramMessageId: PropTypes.number
    })
  )
};

export default AirdropUpdates;
