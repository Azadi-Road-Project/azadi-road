module.exports = {
  siteMetadata: {
    title: `Azadi Road - In Memory of Iran's Freedom Fighters | راه آزادی`,
    description: `A digital memorial honoring those who lost their lives fighting for freedom in Iran. An interactive timeline documenting the faces and stories of freedom fighters from 2009 to present. راه آزادی - یادبود قهرمانان آزادی ایران`,
    siteUrl: `https://azadiroad.com`,
    author: `Azadi Road Project`,
    keywords: `Iran protests, freedom fighters, human rights Iran, Iran memorial, Mahsa Amini, Woman Life Freedom, Iran victims, political prisoners Iran, راه آزادی, جنبش آزادی ایران`,
    image: `/images/og-image.jpg`,
    twitterUsername: `@AzadiRoad`,
    language: `en-US`,
    alternateLanguages: [
      { lang: 'fa', url: 'https://azadiroad.com' }
    ],
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `memorials`,
        path: `${__dirname}/content/memorials`,
      },
    },
    `gatsby-transformer-remark`,
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                siteUrl
              }
            }
            allSitePage {
              nodes {
                path
              }
            }
          }
        `,
        resolveSiteUrl: () => 'https://azadiroad.com',
        resolvePages: ({ allSitePage: { nodes: allPages } }) => {
          return allPages.map(page => {
            return { ...page }
          })
        },
        serialize: ({ path }) => {
          return {
            url: path,
            changefreq: 'weekly',
            priority: path === '/' ? 1.0 : 0.8,
          }
        },
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Azadi Road - In Memory of Iran's Freedom Fighters`,
        short_name: `Azadi Road`,
        description: `A digital memorial honoring those who lost their lives fighting for freedom in Iran`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/Favicon.svg`,
        lang: `en`,
        localize: [
          {
            start_url: `/`,
            lang: `fa`,
            name: `راه آزادی - یادبود قهرمانان آزادی ایران`,
            short_name: `راه آزادی`,
            description: `یادبود دیجیتال به یاد کسانی که برای آزادی ایران جان خود را از دست دادند`,
          },
        ],
      },
    },
  ],
}
