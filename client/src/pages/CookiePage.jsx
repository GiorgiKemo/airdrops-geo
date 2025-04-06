import React from 'react';

const CookiePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[var(--macos-text)]">Cookie Policy</h1>
        
        <div className="macos-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[var(--macos-text)]">1. Introduction</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            This Cookie Policy explains how Airdrops.geo uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">2. What Are Cookies?</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
          </p>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            Cookies set by the website owner (in this case, Airdrops.geo) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics).
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">3. Types of Cookies We Use</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            We use the following types of cookies:
          </p>
          <ul className="list-disc pl-6 mb-4 text-[var(--macos-text-secondary)]">
            <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.</li>
            <li><strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.</li>
            <li><strong>Functional Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.</li>
            <li><strong>Targeting Cookies:</strong> These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">4. How to Control Cookies</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
          </p>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            The specific way to refuse cookies through your web browser controls varies from browser to browser. Please visit your browser's help menu for more information.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">5. Third-Party Cookies</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">6. What About Other Tracking Technologies?</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            Cookies are not the only way to recognize or track visitors to a website. We may use other, similar technologies from time to time, like web beacons (sometimes called "tracking pixels" or "clear gifs"). These are tiny graphics files that contain a unique identifier that enables us to recognize when someone has visited our website.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">7. Changes to This Cookie Policy</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-6 text-[var(--macos-text)]">8. Contact Us</h2>
          <p className="mb-4 text-[var(--macos-text-secondary)]">
            If you have any questions about our use of cookies or other technologies, please contact us at:
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

export default CookiePage;
