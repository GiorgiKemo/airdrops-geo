import { Link } from 'react-router-dom';
import ScrollLink from './ScrollLink';
import { FaTwitter, FaDiscord, FaTelegram, FaGithub } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="macos-card mt-8 py-6 sm:py-8 border-t border-[var(--macos-card-border)]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[var(--macos-text)]">Airdrops.geo</h3>
            <p className="text-sm text-[var(--macos-text-secondary)] mb-4">
              Discover the latest cryptocurrency airdrops. Claim free tokens and participate in exciting crypto projects.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[var(--macos-text)]">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <ScrollLink to="/" className="text-sm text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]">
                  Home
                </ScrollLink>
              </li>
              <li>
                <ScrollLink to="/all" className="text-sm text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]">
                  All Airdrops
                </ScrollLink>
              </li>
              <li>
                <ScrollLink to="/dashboard" className="text-sm text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]">
                  My Airdrops
                </ScrollLink>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[var(--macos-text)]">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/GiorgiKemo/airdrops-geo" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="https://discord.gg/hb8wamm4Sn" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]">
                  Community Support
                </a>
              </li>
              <li>
                <ScrollLink to="/terms" className="text-sm text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]">
                  Terms of Service
                </ScrollLink>
              </li>
              <li>
                <ScrollLink to="/privacy" className="text-sm text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]">
                  Privacy Policy
                </ScrollLink>
              </li>
              <li>
                <ScrollLink to="/cookies" className="text-sm text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]">
                  Cookie Policy
                </ScrollLink>
              </li>
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[var(--macos-text)]">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="https://x.com/GiorgiKem" target="_blank" rel="noopener noreferrer" className="text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]" aria-label="Twitter">
                <FaTwitter size={20} />
              </a>
              <a href="https://discord.gg/hb8wamm4Sn" target="_blank" rel="noopener noreferrer" className="text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]" aria-label="Discord">
                <FaDiscord size={20} />
              </a>
              <a href="https://t.me/+YA6alcZ4s900YjQy" target="_blank" rel="noopener noreferrer" className="text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]" aria-label="Telegram">
                <FaTelegram size={20} />
              </a>
              <a href="https://github.com/GiorgiKemo" target="_blank" rel="noopener noreferrer" className="text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]" aria-label="GitHub">
                <FaGithub size={20} />
              </a>
            </div>
            <div>
              <p className="text-sm text-[var(--macos-text-secondary)] mb-2">Subscribe to our newsletter</p>
              <div className="flex flex-row w-full max-w-xs">
                <input
                  type="email"
                  placeholder="Your email"
                  className="macos-input text-sm py-1 px-2 flex-grow min-w-0"
                />
                <button className="macos-button text-xs py-1 px-3 ml-2 whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-4 border-t border-[var(--macos-card-border)] flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-[var(--macos-text-secondary)] mb-2 sm:mb-0">
            © {currentYear} Airdrops.geo. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <ScrollLink to="/terms" className="text-xs text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]">
              Terms
            </ScrollLink>
            <ScrollLink to="/privacy" className="text-xs text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]">
              Privacy
            </ScrollLink>
            <ScrollLink to="/cookies" className="text-xs text-[var(--macos-text-secondary)] hover:text-[var(--macos-primary)]">
              Cookies
            </ScrollLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
