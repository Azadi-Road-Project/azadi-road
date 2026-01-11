import { useNavigate, useParams } from 'react-router-dom';
import { memorials } from '../data/memorials';
import { useEffect, useRef } from 'react';
import './Timeline.css';

const Timeline = () => {
  const navigate = useNavigate();
  const { personId, year } = useParams();
  const timelineRef = useRef(null);
  const activeItemRef = useRef(null);

  // Get the year of currently selected person or year from route
  const currentPerson = memorials.find(h => h.id === personId);
  const selectedYear = year ? parseInt(year) : (currentPerson ? new Date(currentPerson.died_at).getFullYear() : null);

  // Count memorials per year
  const yearCounts = {};
  memorials.forEach(hero => {
    const year = new Date(hero.died_at).getFullYear();
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  });

  // Generate years from 1979 to 2026
  const years = [];
  for (let year = 1979; year <= 2026; year++) {
    years.push(year);
  }

  // Get max count for scaling
  const maxCount = Math.max(...Object.values(yearCounts));

  // Auto-scroll to active year
  useEffect(() => {
    if (activeItemRef.current && timelineRef.current) {
      const container = timelineRef.current;
      const activeItem = activeItemRef.current;
      
      // Calculate scroll position to center the active item
      const scrollPosition = activeItem.offsetLeft - (container.clientWidth / 2) + (activeItem.clientWidth / 2);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [selectedYear]);

  // Enable horizontal scrolling with mouse wheel
  useEffect(() => {
    const container = timelineRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // Prevent default vertical scroll
      e.preventDefault();
      // Convert vertical scroll to horizontal scroll with larger multiplier
      container.scrollLeft += e.deltaY * 3;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleYearClick = (year) => {
    // Navigate to year list view
    navigate(`/year/${year}`);
  };

  const scrollTimeline = (direction) => {
    if (timelineRef.current) {
      const scrollAmount = 300; // pixels to scroll
      const newPosition = timelineRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      timelineRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  const renderYearItem = (year) => {
    const count = yearCounts[year] || 0;
    const hasmemorials = count > 0;
    const isActive = year === selectedYear;
    
    // Calculate size based on count (scale between 1 and 2.5)
    const scale = hasmemorials ? 1 + (count / maxCount) * 1.5 : 0.5;
    
    // Calculate opacity based on count (0.3 for no memorials, full opacity for memorials)
    const opacity = hasmemorials ? 0.4 + (count / maxCount) * 0.6 : 0.3;

    return (
      <div
        key={year}
        ref={isActive ? activeItemRef : null}
        className={`timeline-item ${isActive ? 'active' : ''} ${hasmemorials ? 'has-memorials' : 'empty'}`}
        onClick={() => hasmemorials && handleYearClick(year)}
        style={{
          cursor: hasmemorials ? 'pointer' : 'default'
        }}
      >
        <div 
          className="timeline-dot"
          style={{
            transform: `scale(${scale})`,
            opacity: opacity
          }}
        >
          {count > 0 && <span className="count-badge">{count}</span>}
        </div>
        <div className="timeline-label">{year}</div>
      </div>
    );
  };


  return (
    <div className="timeline-wrapper">


      {/* Left scroll button */}
      <button 
        className="timeline-scroll-btn timeline-scroll-left"
        onClick={() => scrollTimeline('left')}
        aria-label="Scroll timeline left"
      >
        ‹
      </button>

      {/* Scrollable middle section */}
      <div className="timeline-container" ref={timelineRef}>
        <div className="timeline-fade-left"></div>
        <div className="timeline">
          {years.map(year => renderYearItem(year))}
        </div>
        <div className="timeline-fade-right"></div>
      </div>

      {/* Right scroll button */}
      <button 
        className="timeline-scroll-btn timeline-scroll-right"
        onClick={() => scrollTimeline('right')}
        aria-label="Scroll timeline right"
      >
        ›
      </button>


    </div>
  );
};

export default Timeline;
