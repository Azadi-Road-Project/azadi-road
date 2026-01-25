import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import VerificationBadge from './VerificationBadge';
import './ListView.css';

// Helper function to get image path
const getImagePath = (person) => {
  // If person has explicit image property, use it
  if (person.image) return person.image;
  // Otherwise generate from ID with year-based path
  const year = new Date(person.died_at).getFullYear();
  return `/images/memorials/${year}/${person.id}.jpg`;
};

// Helper function to get placeholder image based on sex
const getPlaceholderImage = (person) => {
  if (person.sex === 'female') {
    return '/images/placeholder-female.jpg';
  }
  // For male, unknown, other, or undefined
  return '/images/placeholder-male.jpg';
};

// Separate component for each person card to handle image state
const PersonCard = ({ person, onPersonClick, formatDate, getAge }) => {
  const [imageSrc, setImageSrc] = useState(getImagePath(person));

  const handleImageError = () => {
    setImageSrc(getPlaceholderImage(person));
  };

  return (
    <article 
      className="listview-card"
      onClick={() => onPersonClick(person.id)}
      role="listitem"
      itemScope
      itemType="https://schema.org/Person"
    >
      <div className="card-image">
        <img 
          src={imageSrc} 
          alt={`Portrait of ${person.name}, age ${getAge(person.born_at, person.died_at)}`}
          onError={handleImageError}
          itemProp="image"
        />
      </div>
      
      <div className="card-content">
        <VerificationBadge verified={person.verified} />
        <h2 className="card-name" itemProp="name">{person.name}</h2>
        
        <dl className="card-details">
          <div className="card-detail-item">
            <dt className="detail-label">Date:</dt>
            <dd className="detail-value">
              <time dateTime={person.died_at} itemProp="deathDate">{formatDate(person.died_at)}</time>
            </dd>
          </div>
          
          <div className="card-detail-item">
            <dt className="detail-label">Age:</dt>
            <dd className="detail-value" itemProp="age">{getAge(person.born_at, person.died_at)}</dd>
          </div>
          
          <div className="card-detail-item">
            <dt className="detail-label">City:</dt>
            <dd className="detail-value" itemProp="deathPlace">{person.city}</dd>
          </div>
        </dl>
        
        <p className="card-cause" itemProp="deathCause">
          {person.causeOfDeath}
        </p>
      </div>
    </article>
  );
};

const ListView = ({ memorials }) => {
  // Sort by date (oldest first)
  const sortedMemorials = [...memorials].sort((a, b) => {
    return new Date(a.died_at) - new Date(b.died_at);
  });

  const year = sortedMemorials.length > 0 
    ? new Date(sortedMemorials[0].died_at).getFullYear() 
    : null;

  // Update meta tags for year pages
  useEffect(() => {
    const baseUrl = window.location.origin;
    const currentUrl = window.location.href;
    
    // Store original values
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.content;
    
    // Update document title
    document.title = `${year} Memorials - Azadi Road | راه آزادی`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = `In memory of ${sortedMemorials.length} freedom fighters who lost their lives in ${year}. Honoring those who sacrificed for freedom in Iran.`;
    }
    
    // Update Open Graph tags
    const updateMetaTag = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        tag.content = content;
      }
    };
    
    updateMetaTag('og:title', `${year} Memorials - Azadi Road`);
    updateMetaTag('og:description', `In memory of ${sortedMemorials.length} freedom fighters who lost their lives in ${year}.`);
    updateMetaTag('og:url', currentUrl);
    
    updateMetaTag('twitter:title', `${year} Memorials - Azadi Road`);
    updateMetaTag('twitter:description', `In memory of ${sortedMemorials.length} freedom fighters who lost their lives in ${year}.`);
    updateMetaTag('twitter:url', currentUrl);
    
    // Add canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;
    
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
      
      updateMetaTag('twitter:title', 'Azadi Road - In Memory of Iran\'s Freedom Fighters | راه آزادی');
      updateMetaTag('twitter:description', 'A digital memorial honoring those who lost their lives fighting for freedom in Iran. An interactive timeline documenting the faces and stories of freedom fighters.');
      updateMetaTag('twitter:url', baseUrl);
    };
  }, [year, sortedMemorials.length]);

  const handlePersonClick = (personId) => {
    navigate(`/memorial/${personId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getAge = (bornAt, diedAt) => {
    if (!bornAt || bornAt === 'Unknown') return 'Unknown';
    
    const born = new Date(bornAt);
    const died = new Date(diedAt);
    
    if (isNaN(born.getTime())) return 'Unknown';
    
    let age = died.getFullYear() - born.getFullYear();
    const monthDiff = died.getMonth() - born.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && died.getDate() < born.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <section className="listview-container" aria-label="Memorial list">
      <header className="listview-header">
        <h1>{year} - {sortedMemorials.length} {sortedMemorials.length === 1 ? 'Memorial' : 'Memorials'}</h1>
        <p className="listview-subtitle">Click on any name to view their full profile</p>
      </header>

      <div className="listview-grid" role="list">
        {sortedMemorials.map(person => (
          <PersonCard 
            key={person.id}
            person={person}
            onPersonClick={handlePersonClick}
            formatDate={formatDate}
            getAge={getAge}
          />
        ))}
      </div>
    </section>
  );
};

export default ListView;
