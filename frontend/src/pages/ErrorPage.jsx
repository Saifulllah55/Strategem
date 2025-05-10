import React from 'react';

function ErrorPg() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-lg mb-6">The page you are looking for doesn't exist.</p>
        <a
          href="/"
          className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded transition duration-300"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}

export default ErrorPg;
