import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { memorials } from '../data/memorials';
import dayjs from 'dayjs';
import jalaliday from 'jalali-dayjs';
import VerificationBadge from './VerificationBadge';
import './PersonProfile.css';

// Extend dayjs with jalali support
dayjs.extend(jalaliday);

// Helper function to get image path
const getImagePath = (person) => {
  // If person has explicit image property, use it
  if (person.image) return person.image;
  // Otherwise generate from ID
  console.log(`/images/memorials/${person.id}.jpg`)
  return `/images/memorials/${person.id}.jpg`;
};

// Helper function to get placeholder image based on sex
const getPlaceholderImage = (person) => {
  if (person.sex === 'female') {
    return '/images/memorials/placeholder-female.jpg';
  }
  // For male, unknown, other, or undefined
  return '/images/memorials/placeholder-male.jpg';
};

const PersonProfile = () => {
  const { personId } = useParams();
  const navigate = useNavigate();
  const currentIndex = memorials.findIndex(h => h.id === personId);
  const person = memorials[currentIndex];
  const [imageSrc, setImageSrc] = useState('');

  if (!person) {
    return <Navigate to={`/memorial/${memorials[0].id}`} replace />;
  }

  // Initialize image source when person changes
  useEffect(() => {
    setImageSrc(getImagePath(person));
  }, [person]);

  // Handle image load error
  const handleImageError = () => {
    setImageSrc(getPlaceholderImage(person));
  };

  const calculateAge = (person) => {
    if (person.born_at && person.died_at) {
      // Parse dates - supports both DD-MM-YYYY and YYYY-MM-DD formats
      const parseDate = (dateStr) => {
        // Check if format is DD-MM-YYYY or YYYY-MM-DD
        if (dateStr.includes('-')) {
          const parts = dateStr.split('-');
          if (parts[0].length === 4) {
            // YYYY-MM-DD
            return dayjs(dateStr, 'YYYY-MM-DD');
          } else {
            // DD-MM-YYYY
            return dayjs(dateStr, 'DD-MM-YYYY');
          }
        }
        return dayjs(dateStr);
      };

      const bornDate = parseDate(person.born_at);
      const diedDate = parseDate(person.died_at);

      if (bornDate.isValid() && diedDate.isValid()) {
        return diedDate.diff(bornDate, 'year');
      }
    }
    
    return person.age !== undefined ? person.age : '-';
  };

  const age = calculateAge(person);

  // Get links as an array (supports both single link and array of links)
  const getLinks = (person) => {
    if (!person.links && !person.link) return [];
    if (person.links && Array.isArray(person.links)) return person.links;
    if (person.link) return [person.link];
    return [];
  };

  const links = getLinks(person);

  // Get location string (city and/or province)
  const getLocation = (person) => {
    const parts = [];
    if (person.city) parts.push(person.city);
    if (person.province) parts.push(person.province);
    return parts.join(', ');
  };

  const location = getLocation(person);

  // Format death date if exists
  const formatDeathDate = (person) => {
    if (!person.died_at) return null;
    
    const parseDate = (dateStr) => {
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
          return dayjs(dateStr, 'YYYY-MM-DD');
        } else {
          return dayjs(dateStr, 'DD-MM-YYYY');
        }
      }
      return dayjs(dateStr);
    };

    const date = parseDate(person.died_at);
    return date.isValid() ? date.format('MMMM D, YYYY') : null;
  };

  const deathDate = formatDeathDate(person);

  const goToPrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : memorials.length - 1;
    navigate(`/memorial/${memorials[prevIndex].id}`);
  };

  const goToNext = () => {
    const nextIndex = currentIndex < memorials.length - 1 ? currentIndex + 1 : 0;
    navigate(`/memorial/${memorials[nextIndex].id}`);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex]); // Re-run effect when currentIndex changes

  // Extract year from died_at
  const getYear = (person) => {
    if (!person.died_at) return null;
    const parseDate = (dateStr) => {
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
          return dayjs(dateStr, 'YYYY-MM-DD');
        } else {
          return dayjs(dateStr, 'DD-MM-YYYY');
        }
      }
      return dayjs(dateStr);
    };
    const date = parseDate(person.died_at);
    return date.isValid() ? date.format('YYYY') : null;
  };

  const year = getYear(person);

  return (
    <div className="person-profile">
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={() => navigate('/')}>Homepage</span>
        {year && (
          <>
            <span className="breadcrumb-separator"> &gt; </span>
            <span className="breadcrumb-link" onClick={() => navigate(`/year/${year}`)}>{year}</span>
          </>
        )}
        <span className="breadcrumb-separator"> &gt; </span>
        <span className="breadcrumb-current">{person.name}</span>
      </div>
      
      <button className="nav-arrow nav-arrow-left" onClick={goToPrevious} aria-label="Previous person">
        ‹
      </button>
      
      <div className="profile-content">
        <div className="profile-image-container">
          <img 
            src={imageSrc} 
            alt={person.name}
            className="profile-image"
            onError={handleImageError}
          />
        </div>
        
        <div className="profile-details">
          <VerificationBadge verified={person.verified} />
          <h2 className="profile-name">
            {person.name}
          </h2>

          <p className="profile-cause">
            {person.causeOfDeath}
            {deathDate && <span className="death-date"> ({deathDate})</span>}
          </p>
          <p className="profile-age">
            Age: {age}
            {location && <span className="profile-location"> • {location}</span>}
          </p>
          <p className="profile-description">{person.description}</p>
          
          {links.length > 0 && (
            <div className="profile-links">
              <span className="links-label">Links: </span>
              {links.map((link, index) => (
                <span key={index}>
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="profile-link"
                  >
                    {index + 1}
                  </a>
                  {index < links.length - 1 && ', '}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <button className="nav-arrow nav-arrow-right" onClick={goToNext} aria-label="Next person">
        ›
      </button>
    </div>
  );
};

export default PersonProfile;
