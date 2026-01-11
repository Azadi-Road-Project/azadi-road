import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { memorials } from '../data/memorials';
import VerificationBadge from './VerificationBadge';
import './ListView.css';

// Helper function to get image path
const getImagePath = (person) => {
  // If person has explicit image property, use it
  if (person.image) return person.image;
  // Otherwise generate from ID
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

// Separate component for each person card to handle image state
const PersonCard = ({ person, onPersonClick, formatDate, getAge }) => {
  const [imageSrc, setImageSrc] = useState(getImagePath(person));

  const handleImageError = () => {
    setImageSrc(getPlaceholderImage(person));
  };

  return (
    <div 
      className="listview-card"
      onClick={() => onPersonClick(person.id)}
    >
      <div className="card-image">
        <img 
          src={imageSrc} 
          alt={person.name}
          onError={handleImageError}
        />
      </div>
      
      <div className="card-content">
        <VerificationBadge verified={person.verified} />
        <h3 className="card-name">{person.name}</h3>
        
        <div className="card-details">
          <div className="card-detail-item">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{formatDate(person.died_at)}</span>
          </div>
          
          <div className="card-detail-item">
            <span className="detail-label">Age:</span>
            <span className="detail-value">{getAge(person.born_at, person.died_at)}</span>
          </div>
          
          <div className="card-detail-item">
            <span className="detail-label">City:</span>
            <span className="detail-value">{person.city}</span>
          </div>
        </div>
        
        <div className="card-cause">
          {person.causeOfDeath}
        </div>
      </div>
    </div>
  );
};

const ListView = () => {
  const navigate = useNavigate();
  const { year } = useParams();
  
  // Filter memorials by year
  const yearMemorials = memorials.filter(hero => {
    const heroYear = new Date(hero.died_at).getFullYear();
    return heroYear === parseInt(year);
  });

  // Sort by date (oldest first - from first day to last day of month)
  const sortedMemorials = [...yearMemorials].sort((a, b) => {
    return new Date(a.died_at) - new Date(b.died_at);
  });

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
    <div className="listview-container">
      <div className="listview-header">
        <h2>{year} - {sortedMemorials.length} {sortedMemorials.length === 1 ? 'Memorial' : 'Memorials'}</h2>
        <p className="listview-subtitle">Click on any name to view their full profile</p>
      </div>

      <div className="listview-grid">
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
    </div>
  );
};

export default ListView;
