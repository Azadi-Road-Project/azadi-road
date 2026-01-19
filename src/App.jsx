import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Timeline from './components/Timeline';
import PersonProfile from './components/PersonProfile';
import ListView from './components/ListView';
import { memorials } from './data/memorials';
import './App.css';

function App() {
  const [showBanner, setShowBanner] = useState(true);

  // Find the most recent year by death date
  const mostRecentYear = memorials.reduce((latest, hero) => {
    return new Date(hero.died_at) > new Date(latest.died_at) ? hero : latest;
  }, memorials[0]);
  const latestYear = new Date(mostRecentYear.died_at).getFullYear();

  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Azadi Road</h1>
          <p className="app-subtitle">In Memory of the Fallen memorials of Freedom</p>
        </header>

        <main>
        <Routes>
          <Route path="/year/:year" element={
            <>
              <Timeline />
              <ListView />
            </>
          } />
          <Route path="/memorial/:personId" element={
            <>
              <Timeline />
              <PersonProfile />
            </>
          } />
          <Route path="/" element={<Navigate to={`/year/${latestYear}`} replace />} />
        </Routes>
        </main>
        
        <footer className="app-footer" role="contentinfo">
          <p>
            Built with ❤️ for freedom fighters | 
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
              onClick={() => setShowBanner(false)}
              aria-label="Close disclaimer"
            >
              ×
            </button>
            <h4 className="banner-title">Disclaimer & Sensitivity Notice</h4>
            <p className="banner-text">
              This project is an independent, community-driven initiative dedicated to documenting and honoring the victims of protests in the Islamic Republic of Iran. Please note that this platform is <span className='beta-text'>currently in its Beta Phase</span>. To manage the extensive volume of records, initial data processing has been AI-assisted. While we are committed to verifying every entry against human rights reports and open-source data, some details may be incomplete or subject to correction as new information emerges. This site contains sensitive content, including descriptions of violence, which some users may find distressing.
            </p>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
