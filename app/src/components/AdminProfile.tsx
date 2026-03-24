import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AdminProfile: React.FC = () => {
  const [name, setName] = useState('Velavan');
  const [email, setEmail] = useState('velavan18007@gmail.com');

  // Load from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('name');
    const savedEmail = localStorage.getItem('email');
    
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleEditProfile = () => {
    const newName = prompt('Enter your name:', name);
    const newEmail = prompt('Enter your email:', email);

    if (newName && newEmail) {
      setName(newName);
      setEmail(newEmail);
      
      // Save to localStorage
      localStorage.setItem('name', newName);
      localStorage.setItem('email', newEmail);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white rounded-lg shadow-md border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Admin</h3>
            <p className="text-sm text-gray-600">Project Owner</p>
          </div>
        </div>
        
        <motion.button
          onClick={handleEditProfile}
          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Edit Profile
        </motion.button>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-3 pt-3 border-t border-gray-200"
      >
        <p className="text-sm text-gray-700">
          <span className="font-medium">Name:</span> {name}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Email:</span> {email}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AdminProfile;
