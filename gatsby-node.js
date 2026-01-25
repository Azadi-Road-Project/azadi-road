const path = require('path');

// Define custom schema for links field to support both string URLs and {url, label} objects
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  
  const typeDefs = `
    type MarkdownRemarkFrontmatter {
      links: [Link]
    }
    
    type Link {
      url: String
      label: String
    }
  `;
  
  createTypes(typeDefs);
};

// Disable ESLint in webpack to avoid config conflicts
exports.onCreateWebpackConfig = ({ actions, stage, getConfig }) => {
  if (stage === 'develop' || stage === 'build-javascript') {
    const config = getConfig();
    
    // Remove ESLint webpack plugin
    config.plugins = config.plugins.filter(
      plugin => plugin.constructor.name !== 'ESLintWebpackPlugin'
    );
    
    // Fix MiniCssExtractPlugin warning
    const miniCssExtractPlugin = config.plugins.find(
      plugin => plugin.constructor.name === 'MiniCssExtractPlugin'
    );
    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.ignoreOrder = true;
    }
    
    actions.replaceWebpackConfig(config);
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  // Query all memorial markdown files
  const result = await graphql(`
    query {
      allMarkdownRemark {
        nodes {
          id
          frontmatter {
            id
            died_at
          }
        }
      }
    }
  `);

  if (result.errors) {
    throw result.errors;
  }

  const memorials = result.data.allMarkdownRemark.nodes;

  // Create individual memorial pages
  memorials.forEach((memorial) => {
    createPage({
      path: `/memorial/${memorial.frontmatter.id}`,
      component: path.resolve(`./src/templates/memorial.jsx`),
      context: {
        id: memorial.id,
        personId: memorial.frontmatter.id,
      },
    });
  });

  // Group memorials by year
  const memorialsByYear = {};
  memorials.forEach((memorial) => {
    const year = new Date(memorial.frontmatter.died_at).getFullYear();
    if (!memorialsByYear[year]) {
      memorialsByYear[year] = [];
    }
    memorialsByYear[year].push(memorial);
  });

  // Create year pages
  Object.keys(memorialsByYear).forEach((year) => {
    createPage({
      path: `/year/${year}`,
      component: path.resolve(`./src/templates/year.jsx`),
      context: {
        year: parseInt(year),
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
      },
    });
  });

  // Create index page redirecting to latest year
  const years = Object.keys(memorialsByYear).map(Number).sort((a, b) => b - a);
  const latestYear = years[0];

  createPage({
    path: `/`,
    component: path.resolve(`./src/templates/index.jsx`),
    context: {
      latestYear,
    },
  });
};
