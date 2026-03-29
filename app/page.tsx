import React from 'react';
import { FaLinkedin, FaGlobe, FaXTwitter } from 'react-icons/fa6';


const ComingSoonPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-4">Coming Soon</h1>
      <p className="text-xl mb-8">My new blog is on its way.</p>
      <div className="text-center">
        <p className="text-lg">In the meantime, you can find me here:</p>
        <div className="flex justify-center space-x-4 mt-4">
          <a href="https://www.linkedin.com/in/rajivnayanc" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            <FaLinkedin className="h-6 w-6" />
          </a>
          <a href="https://rajivnayanc.com" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
            <FaGlobe className="h-6 w-6" />
          </a>
          <a href="https://x.com/rajivnayanc" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300">
            <FaXTwitter className="h-6 w-6" />
          </a>
        </div>
        <p className="mt-8 text-sm text-gray-500">
          - Rajiv Nayan Choubey -
        </p>
      </div>
    </div>
  );
};

export default ComingSoonPage;
