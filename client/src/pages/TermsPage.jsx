import React from 'react';

const TermsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[var(--macos-text)]">Terms of Service</h1>
        
        <div className="macos-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[var(--macos-text)]">1. Introduction</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            Welcome to Airdrops.geo. These Terms of Service govern your use of our website located at [website URL] and form a binding legal agreement between you and Airdrops.geo.
          </p>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            By accessing or using our website, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the website.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">2. Definitions</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            <strong>"Service"</strong> refers to the website operated by Airdrops.geo.<br />
            <strong>"User"</strong> refers to individuals who access or use the Service.<br />
            <strong>"Content"</strong> refers to information displayed on the Service, including but not limited to text, images, audio, video, and interactive features.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">3. Use of the Service</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            You may use our Service only as permitted by law and these Terms. You agree not to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-[var(--macos-text-secondary)]">
            <li>Use the Service in any way that violates any applicable laws or regulations</li>
            <li>Attempt to interfere with the proper functioning of the Service</li>
            <li>Bypass any measures we may use to prevent or restrict access to the Service</li>
            <li>Use the Service to distribute unsolicited promotional or commercial content</li>
            <li>Impersonate or attempt to impersonate Airdrops.geo, an employee, or another user</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">4. Intellectual Property</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            The Service and its original content, features, and functionality are owned by Airdrops.geo and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">5. Disclaimer</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            The information provided on our Service is for general informational purposes only. We make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information contained on the Service.
          </p>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            Cryptocurrency airdrops involve risk, and the information we provide should not be considered financial advice. Always conduct your own research before participating in any cryptocurrency airdrop.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">6. Limitation of Liability</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            In no event shall Airdrops.geo, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">7. Changes to Terms</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">8. Contact Us</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            If you have any questions about these Terms, please contact us at:
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

export default TermsPage;
