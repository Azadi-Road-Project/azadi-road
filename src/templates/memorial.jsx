import React, { useState, useEffect } from 'react';
import { graphql, navigate, Link } from 'gatsby';
import dayjs from 'dayjs';
import jalaliday from 'jalali-dayjs';
import Layout from '../components/Layout';
import VerificationBadge from '../components/VerificationBadge';
import SEO from '../components/SEO';
import { getMemorialImagePath } from '../utils/memorialImage';
import '../components/PersonProfile.css';

// Extend dayjs with jalali support
dayjs.extend(jalaliday);

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
  const siteUrl = 'https://azadiroad.com';
  
  const currentIndex = allMemorials.findIndex(h => h.frontmatter.id === person.id);
  const [imageSrc, setImageSrc] = useState(getMemorialImagePath(person));

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
  const sameAsLinks = links.map((link) => link.url).filter(Boolean);

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

  const profilePath = `/memorial/${person.id}`;
  const profileUrl = `${siteUrl}${profilePath}`;
  const imagePath = getMemorialImagePath(person);
  const absoluteImageUrl = imagePath.startsWith('http')
    ? imagePath
    : `${siteUrl}${imagePath}`;

  const prevIndex = currentIndex > 0 ? currentIndex - 1 : allMemorials.length - 1;
  const nextIndex = currentIndex < allMemorials.length - 1 ? currentIndex + 1 : 0;
  const previousPersonId = allMemorials[prevIndex]?.frontmatter?.id;
  const nextPersonId = allMemorials[nextIndex]?.frontmatter?.id;

  const plainTextDescription = memorial.html
    ? memorial.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

  // Extract year
  const getYear = (person) => {
    if (!person.died_at) return null;
    const date = dayjs(person.died_at);
    return date.isValid() ? date.format('YYYY') : null;
  };

  const year = getYear(person);

  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Homepage',
      item: siteUrl,
    },
  ];

  if (year) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: String(year),
      item: `${siteUrl}/year/${year}`,
    });
  }

  breadcrumbItems.push({
    '@type': 'ListItem',
    position: year ? 3 : 2,
    name: person.name,
    item: profileUrl,
  });

  const personStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    ...(person.name_fa ? { alternateName: person.name_fa } : {}),
    url: profileUrl,
    image: absoluteImageUrl,
    ...(plainTextDescription ? { description: plainTextDescription } : {}),
    ...(person.died_at ? { deathDate: person.died_at } : {}),
    ...(location ? { deathPlace: { '@type': 'Place', name: location } } : {}),
    ...(sameAsLinks.length > 0 ? { sameAs: sameAsLinks } : {}),
    mainEntityOfPage: profileUrl,
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  // Navigation functions
  const goToPrevious = () => {
    if (previousPersonId) {
      navigate(`/memorial/${previousPersonId}`);
    }
  };

  const goToNext = () => {
    if (nextPersonId) {
      navigate(`/memorial/${nextPersonId}`);
    }
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

  // Get the original image path for SEO (not the state variable which might change)
  const seoImage = imagePath;
  const seoImageAlt = `Portrait photograph of ${person.name}, remembered for their sacrifice during ${person.causeOfDeath}`;

  return (
    <Layout>
      
        <div className="profile-divider" aria-hidden="true" />
        
      <SEO 
        title={`${person.name}${person.name_fa ? ` (${person.name_fa})` : ''} - Memorial | Azadi Road`}
        description={`In memory of ${person.name}${person.name_fa ? ` (${person.name_fa})` : ''}, age ${age}, who ${person.causeOfDeath}${deathDate ? ` on ${deathDate}` : ''}${location ? ` in ${location}` : ''}. A hero of Iran's freedom movement.`}
        pathname={profilePath}
        image={seoImage}
        imageAlt={seoImageAlt}
        article={true}
        datePublished={person.died_at}
      >
        <script type="application/ld+json">{JSON.stringify(personStructuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbStructuredData)}</script>
      </SEO>
      <article className="person-profile" itemScope itemType="https://schema.org/Person">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link className="breadcrumb-link" to="/">Homepage</Link>
          {year && (
            <>
              <span className="breadcrumb-separator"> &gt; </span>
              <Link className="breadcrumb-link" to={`/year/${year}`}>{year}</Link>
            </>
          )}
          <span className="breadcrumb-separator"> &gt; </span>
          <span className="breadcrumb-current" itemProp="name">{person.name}</span>
        </nav>
        {previousPersonId ? (
          <Link className="nav-arrow nav-arrow-left" to={`/memorial/${previousPersonId}`} aria-label="Previous person">
            ‹
          </Link>
        ) : null}
        
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
        
        {nextPersonId ? (
          <Link className="nav-arrow nav-arrow-right" to={`/memorial/${nextPersonId}`} aria-label="Next person">
            ›
          </Link>
        ) : null}
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
        name_fa
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
