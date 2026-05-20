import ScrollLink from './ScrollLink';
import { FaTwitter, FaDiscord, FaTelegram, FaGithub } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-[var(--macos-divider)] bg-[var(--macos-card-bg)] py-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
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
              <form className="flex w-full max-w-xs flex-col gap-2 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
                <label htmlFor="footer-newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-newsletter-email"
                  type="email"
                  placeholder="Your email"
                  autoComplete="email"
                  className="macos-input min-w-0 flex-1 text-sm"
                />
                <button type="submit" className="macos-button min-w-0 text-xs whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-4 border-t border-[var(--macos-card-border)] flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-[var(--macos-text-secondary)] mb-2 sm:mb-0">
            &copy; {currentYear} Airdrops.geo. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
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
