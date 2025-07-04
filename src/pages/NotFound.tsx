import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-x-4">
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-sm font-medium inline-block"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/organizations"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md text-sm font-medium inline-block"
          >
            View Organizations
          </Link>
          <Link
            to="/nodes"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md text-sm font-medium inline-block"
          >
            View Nodes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
