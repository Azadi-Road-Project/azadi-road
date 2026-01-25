import React, { useState, useEffect } from 'react';
import { graphql, navigate } from 'gatsby';
import dayjs from 'dayjs';
import jalaliday from 'jalali-dayjs';
import Layout from '../components/Layout';
import Timeline from '../components/Timeline';
import VerificationBadge from '../components/VerificationBadge';
import '../components/PersonProfile.css';

// Extend dayjs with jalali support
dayjs.extend(jalaliday);

// Helper function to get image path
const getImagePath = (person) => {
  if (person.image) return person.image;
  const year = new Date(person.died_at).getFullYear();
  return `/images/memorials/${year}/${person.id}.jpg`;
};

// Helper function to get placeholder image based on sex
const getPlaceholderImage = (person) => {
  if (person.sex === 'female') {
    return '/images/placeholder-female.jpg';
  }
  return '/images/placeholder-male.jpg';
};

// Get links as an array - only includes links with labels
const getLinks = (person) => {
  if (!person.links || !Array.isArray(person.links)) return [];
  
  // Filter out links without labels
  return person.links.filter(link => link && link.url && link.label);
};

const MemorialTemplate = ({ data, pageContext }) => {
  const memorial = data.markdownRemark;
  const allMemorials = data.allMarkdownRemark.nodes;
  const person = memorial.frontmatter;
  
  const currentIndex = allMemorials.findIndex(h => h.frontmatter.id === person.id);
  const [imageSrc, setImageSrc] = useState(getImagePath(person));

  // Calculate age helper function
  const calculateAge = (person) => {
    if (person.born_at && person.died_at && person.born_at !== 'Unknown') {
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

  // Handle image load error
  const handleImageError = () => {
    setImageSrc(getPlaceholderImage(person));
  };

  const links = getLinks(person);

  // Format death date
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

  // Navigation functions
  const goToPrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : allMemorials.length - 1;
    navigate(`/memorial/${allMemorials[prevIndex].frontmatter.id}`);
  };

  const goToNext = () => {
    const nextIndex = currentIndex < allMemorials.length - 1 ? currentIndex + 1 : 0;
    navigate(`/memorial/${allMemorials[nextIndex].frontmatter.id}`);
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
  }, [currentIndex]);

  // Extract year
  const getYear = (person) => {
    if (!person.died_at) return null;
    const date = dayjs(person.died_at);
    return date.isValid() ? date.format('YYYY') : null;
  };

  const year = getYear(person);

  return (
    <Layout>
      <Timeline selectedYear={year ? parseInt(year) : null} />
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
            <VerificationBadge reviewed={person.reviewed} />
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
            
            {memorial.html && (
              <p className="profile-description" itemProp="description" dangerouslySetInnerHTML={{ __html: memorial.html }} />
            )}
            
            {links.length > 0 && (
              <div className="profile-links">
                <span className="links-label">Links: </span>
                {links.map((link, index) => (
                  <span key={index}>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="profile-link"
                    >
                      {link.label}
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
    </Layout>
  );
};

export const query = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        id
        name
        sex
        age
        causeOfDeath
        image
        born_at
        died_at
        city
        province
        reviewed
        links {
          url
          label
        }
      }
    }
    allMarkdownRemark(sort: { frontmatter: { died_at: ASC } }) {
      nodes {
        id
        frontmatter {
          id
          name
          died_at
        }
      }
    }
  }
`;

export default MemorialTemplate;
