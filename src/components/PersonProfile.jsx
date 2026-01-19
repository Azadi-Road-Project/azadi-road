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

  // Calculate age helper function
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

  // Get location string (city and/or province)
  const getLocation = (person) => {
    const parts = [];
    if (person.city) parts.push(person.city);
    if (person.province) parts.push(person.province);
    return parts.join(', ');
  };

  const location = getLocation(person);

  // Initialize image source when person changes
  useEffect(() => {
    setImageSrc(getImagePath(person));
  }, [person]);

  // Update meta tags and structured data for SEO and social sharing
  useEffect(() => {
    const baseUrl = window.location.origin;
    const currentUrl = window.location.href;
    const personImageUrl = `${baseUrl}${getImagePath(person)}`;
    
    // Store original values
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.content;
    
    // Update document title
    document.title = `${person.name} - Azadi Road Memorial | راه آزادی`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = `In memory of ${person.name}, age ${age}. ${person.causeOfDeath}. ${person.description}`;
    }
    
    // Update Open Graph tags
    const updateMetaTag = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        tag.content = content;
      }
    };
    
    updateMetaTag('og:title', `${person.name} - Azadi Road Memorial`);
    updateMetaTag('og:description', `In memory of ${person.name}, age ${age}. ${person.causeOfDeath}.`);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:image', personImageUrl);
    
    updateMetaTag('twitter:title', `${person.name} - Azadi Road Memorial`);
    updateMetaTag('twitter:description', `In memory of ${person.name}, age ${age}. ${person.causeOfDeath}.`);
    updateMetaTag('twitter:url', currentUrl);
    updateMetaTag('twitter:image', personImageUrl);
    
    // Add canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;
    
    // Add Person structured data (JSON-LD)
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": person.name,
      "deathDate": person.died_at,
      "birthDate": person.born_at,
      "deathPlace": location || undefined,
      "image": personImageUrl,
      "description": person.description,
      "memorialOf": {
        "@type": "Event",
        "name": person.causeOfDeath,
        "description": `${person.name} lost their life during ${person.causeOfDeath}`
      }
    };
    
    // Remove undefined fields
    Object.keys(structuredData).forEach(key => 
      structuredData[key] === undefined && delete structuredData[key]
    );
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'person-structured-data';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    // Cleanup: restore original values when component unmounts
    return () => {
      document.title = originalTitle;
      if (metaDescription && originalDescription) {
        metaDescription.content = originalDescription;
      }
      
      // Reset to default values
      updateMetaTag('og:title', 'Azadi Road - In Memory of Iran\'s Freedom Fighters | راه آزادی');
      updateMetaTag('og:description', 'A digital memorial honoring those who lost their lives fighting for freedom in Iran. An interactive timeline documenting the faces and stories of freedom fighters.');
      updateMetaTag('og:url', baseUrl);
      updateMetaTag('og:image', `${baseUrl}/images/og-image.jpg`);
      
      updateMetaTag('twitter:title', 'Azadi Road - In Memory of Iran\'s Freedom Fighters | راه آزادی');
      updateMetaTag('twitter:description', 'A digital memorial honoring those who lost their lives fighting for freedom in Iran. An interactive timeline documenting the faces and stories of freedom fighters.');
      updateMetaTag('twitter:url', baseUrl);
      updateMetaTag('twitter:image', `${baseUrl}/images/og-image.jpg`);
      
      // Remove structured data script
      const structuredDataScript = document.getElementById('person-structured-data');
      if (structuredDataScript) {
        structuredDataScript.remove();
      }
    };
  }, [person, age, location]);

  // Handle image load error
  const handleImageError = () => {
    setImageSrc(getPlaceholderImage(person));
  };

  // Get links as an array (supports both single link and array of links)
  const getLinks = (person) => {
    if (!person.links && !person.link) return [];
    if (person.links && Array.isArray(person.links)) return person.links;
    if (person.link) return [person.link];
    return [];
  };

  const links = getLinks(person);

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
    <article className="person-profile" itemScope itemType="https://schema.org/Person">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <span className="breadcrumb-link" onClick={() => navigate('/')}>Homepage</span>
        {year && (
          <>
            <span className="breadcrumb-separator"> &gt; </span>
            <span className="breadcrumb-link" onClick={() => navigate(`/year/${year}`)}>{year}</span>
          </>
        )}
        <span className="breadcrumb-separator"> &gt; </span>
        <span className="breadcrumb-current" itemProp="name">{person.name}</span>
      </nav>
      
      <button className="nav-arrow nav-arrow-left" onClick={goToPrevious} aria-label="Previous person">
        ‹
      </button>
      
      <div className="profile-content">
        <figure className="profile-image-container">
          <img 
            src={imageSrc} 
            alt={`Portrait photograph of ${person.name}, remembered for their sacrifice during ${person.causeOfDeath}`}
            className="profile-image"
            onError={handleImageError}
            itemProp="image"
            width="300"
            height="400"
            loading="eager"
          />
        </figure>
        
        <div className="profile-details">
          <VerificationBadge verified={person.verified} />
          <h1 className="profile-name" itemProp="name">
            {person.name}
          </h1>

          <p className="profile-cause">
            <span itemProp="deathCause">{person.causeOfDeath}</span>
            {deathDate && <time className="death-date" dateTime={person.died_at} itemProp="deathDate"> ({deathDate})</time>}
          </p>
          <p className="profile-age">
            <span itemProp="age">Age: {age}</span>
            {location && <address className="profile-location" itemProp="deathPlace"> • {location}</address>}
          </p>
          <p className="profile-description" itemProp="description">{person.description}</p>
          
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
    </article>
  );
};

export default PersonProfile;
