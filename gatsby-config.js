module.exports = {
  siteMetadata: {
    title: `Azadi Road`,
    description: `In Memory of the Fallen Heroes of Freedom - راه آزادی`,
    siteUrl: `https://azadi-road.org`,
    author: `Azadi Road Project`,
  },
  plugins: [
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
    // Uncomment and configure when icon is ready
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Azadi Road`,
        short_name: `Azadi Road`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/Favicon.svg`,
      },
    },
  ],
}
