import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaUpload, FaSpinner } from 'react-icons/fa';

const FileUpload = ({ onFileSelect, accept = "image/*", maxSizeMB = 5, className = "" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const isAcceptedFile = (file) => {
    const acceptedTypes = accept
      .split(',')
      .map(type => type.trim().toLowerCase())
      .filter(Boolean);

    if (acceptedTypes.length === 0) return true;

    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    return acceptedTypes.some((acceptedType) => {
      if (acceptedType.endsWith('/*')) {
        return fileType.startsWith(acceptedType.slice(0, -1));
      }

      if (acceptedType.startsWith('.')) {
        return fileName.endsWith(acceptedType);
      }

      return fileType === acceptedType;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }

    e.target.value = '';
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFileDialog();
    }
  };

  const handleFile = async (file) => {
    setError('');
    
    // Check file type
    if (!isAcceptedFile(file)) {
      setError(`Please upload a supported file type (${accept})`);
      return;
    }
    
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Convert file to base64
      const base64 = await convertToBase64(file);
      
      // Call the callback with the base64 data
      onFileSelect(base64, file);
    } catch (err) {
      setError('Error processing file');
      console.error('File upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-busy={isLoading}
        aria-invalid={error ? 'true' : 'false'}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept={accept}
          className="hidden"
          aria-label="Upload file"
        />
        
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <FaSpinner className="animate-spin text-blue-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Processing...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <FaUpload className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Drag & drop an image or click to browse
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Max size: {maxSizeMB}MB
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

FileUpload.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  accept: PropTypes.string,
  maxSizeMB: PropTypes.number,
  className: PropTypes.string,
};

export default FileUpload;
