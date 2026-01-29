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
          loading="lazy"
        />
      </div>
      
      <div className="card-content">
        <VerificationBadge reviewed={person.reviewed} />
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
  // Pagination state
  const ITEMS_PER_PAGE = 50;
  const [currentPage, setCurrentPage] = useState(1);
  
  // Sort by date (oldest first)
  const sortedMemorials = [...memorials].sort((a, b) => {
    return new Date(a.died_at) - new Date(b.died_at);
  });

  const year = sortedMemorials.length > 0 
    ? new Date(sortedMemorials[0].died_at).getFullYear() 
    : null;

  // Calculate pagination
  const totalPages = Math.ceil(sortedMemorials.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedMemorials = sortedMemorials.slice(startIndex, endIndex);

  // Read page from URL on mount and update when URL changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    }
  }, [totalPages]);

  // Update URL when page changes
  useEffect(() => {
    if (typeof window === 'undefined' || currentPage === 1) return;
    
    const url = new URL(window.location.href);
    url.searchParams.set('page', currentPage.toString());
    window.history.replaceState({}, '', url.toString());
  }, [currentPage]);

  // Scroll to top when page changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  }, [currentPage]);

  // Page navigation handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      
      // Update URL
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (page === 1) {
          url.searchParams.delete('page');
        } else {
          url.searchParams.set('page', page.toString());
        }
        window.history.pushState({}, '', url.toString());
      }
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 7;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

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
        <p className="listview-progress">
          Showing {startIndex + 1}-{Math.min(endIndex, sortedMemorials.length)} of {sortedMemorials.length}
        </p>
      </header>

      <div className="listview-grid" role="list">
        {displayedMemorials.map(person => (
          <PersonCard 
            key={person.id}
            person={person}
            onPersonClick={handlePersonClick}
            formatDate={formatDate}
            getAge={getAge}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="pagination" aria-label="Pagination navigation">
          <button
            className="pagination-button"
            onClick={goToFirstPage}
            disabled={currentPage === 1}
            aria-label="Go to first page"
          >
            « First
          </button>
          
          <button
            className="pagination-button"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            ‹ Previous
          </button>

          <div className="pagination-numbers">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => goToPage(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          <button
            className="pagination-button"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            Next ›
          </button>
          
          <button
            className="pagination-button"
            onClick={goToLastPage}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
          >
            Last »
          </button>
        </nav>
      )}
    </section>
  );
};

export default ListView;
