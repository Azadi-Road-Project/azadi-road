import React from 'react';
import { Link } from 'gatsby';
import Layout from '../components/Layout';

const NotFoundPage = () => {
  return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h1 style={{ fontSize: '72px', margin: '0' }}>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist.</p>
        <Link to="/" style={{ 
          display: 'inline-block',
          marginTop: '20px',
          padding: '10px 20px',
          background: '#663399',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          Go Home
        </Link>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
