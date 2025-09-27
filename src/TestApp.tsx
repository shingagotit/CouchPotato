import React from 'react';

const TestApp = () => {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      margin: 0,
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      color: 'white',
      textAlign: 'center'
    }}>
      <div>
        <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          🍿 CouchPotato
        </div>
        <div style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Test App - React is Working!
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          If you can see this, the React app is loading correctly.
        </div>
      </div>
    </div>
  );
};

export default TestApp;
