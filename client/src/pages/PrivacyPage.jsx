import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[var(--macos-text)]">Privacy Policy</h1>
        
        <div className="macos-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[var(--macos-text)]">1. Introduction</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            At Airdrops.geo, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
          </p>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            By using our website, you consent to the data practices described in this policy.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">2. Information We Collect</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            We may collect the following types of information:
          </p>
          <ul className="list-disc pl-6 mb-4 text-[var(--macos-text-secondary)]">
            <li><strong>Personal Information:</strong> Email address, name, username, and other details you provide when creating an account or subscribing to our newsletter.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited, time spent on pages, and other browsing actions.</li>
            <li><strong>Device Information:</strong> Data about the device you use to access our website, including IP address, browser type, and operating system.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">3. How We Use Your Information</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            We use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc pl-6 mb-4 text-[var(--macos-text-secondary)]">
            <li>Providing and maintaining our website</li>
            <li>Improving and personalizing your experience</li>
            <li>Communicating with you about updates, news, and promotional content</li>
            <li>Analyzing usage patterns to enhance our service</li>
            <li>Detecting and preventing fraudulent activities</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">4. Cookies and Tracking Technologies</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
          </p>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">5. Data Security</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">6. Third-Party Services</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            Our website may contain links to third-party websites or services that are not owned or controlled by Airdrops.geo. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">7. Children's Privacy</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            Our Service does not address anyone under the age of 18. We do not knowingly collect personally identifiable information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">8. Changes to This Privacy Policy</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">9. Contact Us</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul className="list-disc pl-6 mb-4 text-[var(--macos-text-secondary)]">
            <li>Discord: <a href="https://discord.gg/hb8wamm4Sn" target="_blank" rel="noopener noreferrer" className="text-[var(--macos-primary)]">https://discord.gg/hb8wamm4Sn</a></li>
            <li>Twitter/X: <a href="https://x.com/GiorgiKem" target="_blank" rel="noopener noreferrer" className="text-[var(--macos-primary)]">https://x.com/GiorgiKem</a></li>
            <li>Telegram: <a href="https://t.me/+YA6alcZ4s900YjQy" target="_blank" rel="noopener noreferrer" className="text-[var(--macos-primary)]">https://t.me/+YA6alcZ4s900YjQy</a></li>
          </ul>
          
          <p className="mt-6 text-sm text-[var(--macos-text-secondary)]">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
