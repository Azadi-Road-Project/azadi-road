import React, { useEffect } from 'react';
import { navigate } from 'gatsby';
import SEO from '../components/SEO';

const IndexTemplate = ({ pageContext }) => {
  useEffect(() => {
    navigate(`/year/${pageContext.latestYear}`, { replace: true });
  }, [pageContext.latestYear]);

  return (
    <SEO 
      title="Azadi Road - In Memory of Iran's Freedom Fighters | راه آزادی"
      description="A digital memorial honoring those who lost their lives fighting for freedom in Iran. An interactive timeline documenting the faces and stories of freedom fighters from 2009 to present."
      pathname="/"
    />
  );
};

export default IndexTemplate;
