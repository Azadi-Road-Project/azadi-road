import React, { useEffect } from 'react';
import { navigate } from 'gatsby';

const IndexTemplate = ({ pageContext }) => {
  useEffect(() => {
    navigate(`/year/${pageContext.latestYear}`, { replace: true });
  }, [pageContext.latestYear]);

  return null;
};

export default IndexTemplate;
