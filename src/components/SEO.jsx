import React from 'react';
import { Helmet } from 'react-helmet';
import { useStaticQuery, graphql } from 'gatsby';
import PropTypes from 'prop-types';

const SEO = ({ 
  title, 
  description, 
  pathname, 
  image,
  imageAlt, 
  article = false,
  datePublished,
  dateModified,
  children 
}) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            siteUrl
            author
            keywords
            image
            twitterUsername
            language
          }
        }
      }
    `
  );

  const {
    title: defaultTitle,
    description: defaultDescription,
    siteUrl,
    author,
    keywords: defaultKeywords,
    image: defaultImage,
    twitterUsername,
    language,
  } = site.siteMetadata;

  const resolveImageUrl = (imagePath) => {
    if (!imagePath) return `${siteUrl}${defaultImage}`;
    return imagePath.startsWith('http') ? imagePath : `${siteUrl}${imagePath}`;
  };

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    url: `${siteUrl}${pathname || ''}`,
    image: resolveImageUrl(image || defaultImage),
    keywords: defaultKeywords,
  };

  const getImageMimeType = (url) => {
    const normalized = (url || '').toLowerCase();
    if (normalized.endsWith('.png')) return 'image/png';
    if (normalized.endsWith('.webp')) return 'image/webp';
    if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg';
    return undefined;
  };

  const imageType = getImageMimeType(seo.image);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={language} />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={seo.url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:image:secure_url" content={seo.image} />
      <meta property="og:image:alt" content={imageAlt || seo.title} />
      {imageType && <meta property="og:image:type" content={imageType} />}
      <meta property="og:site_name" content={defaultTitle} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="fa_IR" />
      
      {article && datePublished && (
        <meta property="article:published_time" content={datePublished} />
      )}
      {article && dateModified && (
        <meta property="article:modified_time" content={dateModified} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterUsername} />
      <meta name="twitter:creator" content={twitterUsername} />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      {imageAlt && <meta name="twitter:image:alt" content={imageAlt} />}

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="google" content="nositelinkssearchbox" />
      
      {children}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  pathname: PropTypes.string,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  article: PropTypes.bool,
  datePublished: PropTypes.string,
  dateModified: PropTypes.string,
  children: PropTypes.node,
};

export default SEO;
