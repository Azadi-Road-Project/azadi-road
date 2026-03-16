import React from 'react';
import PropTypes from 'prop-types';

export default function HTML(props) {
  return (
    <html {...props.htmlAttributes} lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="description" content="A digital memorial honoring those who lost their lives fighting for freedom in Iran. An interactive timeline documenting the faces and stories of Iran's freedom fighters from 2009 to present. راه آزادی - یادبود قهرمانان آزادی ایران" />
        <meta name="keywords" content="Iran protests, freedom fighters, human rights Iran, Iran memorial, Mahsa Amini, Woman Life Freedom, Iran victims, political prisoners Iran, راه آزادی, جنبش آزادی ایران, مهسا امینی, زن زندگی آزادی" />
        <meta name="author" content="Azadi Road Project" />
        <meta name="theme-color" content="#262b31" />
        <link rel="icon" type="image/svg+xml" href="/Favicon.svg" />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Splash&display=swap" rel="stylesheet" />
        
        {/* Structured Data / JSON-LD */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Azadi Road",
              "alternateName": "راه آزادی",
              "url": "https://azadiroad.com",
              "logo": "https://azadiroad.com/Favicon.svg",
              "description": "A digital memorial honoring those who lost their lives fighting for freedom in Iran. An interactive timeline documenting the faces and stories of freedom fighters.",
              "foundingDate": "2026",
              "sameAs": [
                "https://github.com/Azadi-Road-Project/azadi-road"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Community",
                "url": "https://github.com/Azadi-Road-Project/azadi-road"
              }
            }
          `}
        </script>
        
        {props.headComponents}
      </head>
      <body {...props.bodyAttributes}>
        {props.preBodyComponents}
        <div
          key={`body`}
          id="___gatsby"
          dangerouslySetInnerHTML={{ __html: props.body }}
        />
        {props.postBodyComponents}
      </body>
    </html>
  );
}

HTML.propTypes = {
  htmlAttributes: PropTypes.object,
  headComponents: PropTypes.array,
  bodyAttributes: PropTypes.object,
  preBodyComponents: PropTypes.array,
  body: PropTypes.string,
  postBodyComponents: PropTypes.array,
};
