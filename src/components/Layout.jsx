import React, { useState, useEffect } from 'react';
import '../index.css';
import '../App.css';

const Layout = ({ children }) => {
  const [showBanner, setShowBanner] = useState(() => {
    // Check localStorage on initial render
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('bannerDismissed');
      return dismissed !== 'true';
    }
    return true;
  });

  const handleCloseBanner = () => {
    setShowBanner(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bannerDismissed', 'true');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Azadi Road</h1>
        <p className="app-subtitle">In Memory of the Fallen Heroes of Freedom</p>
      </header>

      <main>{children}</main>

      <footer className="app-footer" role="contentinfo">
        <p>
          Built with ❤️ for freedom fighters |{' '}
          <a
            href="https://github.com/Azadi-Road-Project/azadi-road"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            View on GitHub
          </a>
        </p>
      </footer>

      {showBanner && (
        <div className="disclaimer-banner">
          <button
            className="banner-close"
            onClick={handleCloseBanner}
            aria-label="Close disclaimer"
          >
            ×
          </button>
          <h4 className="banner-title">Disclaimer & Sensitivity Notice</h4>
          <p className="banner-text">
            This project is an independent, community-driven initiative dedicated to documenting and
            honoring the victims of protests in the Islamic Republic of Iran. Please note that this
            platform is <span className="beta-text">currently in its Beta Phase</span>. To manage the
            extensive volume of records, initial data processing has been AI-assisted. While we are
            committed to verifying every entry against human rights reports and open-source data,
            some details may be incomplete or subject to correction as new information emerges. This
            site contains sensitive content, including descriptions of violence, which some users may
            find distressing.
          </p>
        </div>
      )}
    </div>
  );
};

export default Layout;
