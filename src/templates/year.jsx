import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import Timeline from '../components/Timeline';
import ListView from '../components/ListView';
import SEO from '../components/SEO';

const YearTemplate = ({ data, pageContext }) => {
  const memorials = data.allMarkdownRemark.nodes.map(node => {
    // Strip HTML tags from description for list view
    const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : null;
    let description = '';
    if (tempDiv && node.html) {
      tempDiv.innerHTML = node.html;
      description = tempDiv.textContent || tempDiv.innerText || '';
    } else if (node.html) {
      // Fallback: simple regex strip (server-side)
      description = node.html.replace(/<[^>]*>/g, '');
    }
    
    return {
      ...node.frontmatter,
      description,
    };
  });

  return (
    <Layout>
      <SEO 
        title={`${pageContext.year} - Victims of Iran Freedom Movement | Azadi Road`}
        description={`Memorial timeline of ${memorials.length} individuals who lost their lives fighting for freedom in Iran during ${pageContext.year}. Honoring the heroes of Iran's protest movement.`}
        pathname={`/year/${pageContext.year}`}
      />
      <Timeline selectedYear={pageContext.year} />
      <ListView memorials={memorials} />
    </Layout>
  );
};

export const query = graphql`
  query($startDate: Date!, $endDate: Date!) {
    allMarkdownRemark(
      filter: { 
        frontmatter: { 
          died_at: { 
            gte: $startDate
            lte: $endDate
          } 
        } 
      }
      sort: { frontmatter: { died_at: ASC } }
    ) {
      nodes {
        id
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
    }
  }
`;

export default YearTemplate;
