import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RoleBasedRoute from './RoleBasedRoute';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);

  const demoUsers = [
    { id: 1, name: 'Admin User', email: 'admin@demo.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Regular User', email: 'user@demo.com', role: 'user', status: 'active' },
    { id: 3, name: 'Test User', email: 'test@demo.com', role: 'user', status: 'inactive' }
  ];

  const demoActivities = [
    { id: 1, user: 'Regular User', activity: 'Solved Binary Tree Traversal', date: '2024-07-31' },
    { id: 2, user: 'Test User', activity: 'Practiced Dynamic Programming', date: '2024-07-30' },
    { id: 3, user: 'Regular User', activity: 'Reviewed Array Algorithms', date: '2024-07-29' }
  ];

  return (
    <RoleBasedRoute allowedRoles={['admin']}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-3">⚙️</span>
          Admin Dashboard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg card-hover">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{demoUsers.length}</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg card-hover">
            <h3 className="text-lg font-semibold mb-2">Active Sessions</h3>
            <p className="text-3xl font-bold">{demoUsers.filter(u => u.status === 'active').length}</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg card-hover">
            <h3 className="text-lg font-semibold mb-2">Total Activities</h3>
            <p className="text-3xl font-bold">{demoActivities.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <button
              onClick={() => setShowUserManagement(!showUserManagement)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg btn-hover font-medium mb-4"
            >
              👥 User Management {showUserManagement ? '▼' : '▶'}
            </button>
            
            {showUserManagement && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-fadeIn">
                <div className="space-y-3">
                  {demoUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setShowActivityLog(!showActivityLog)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg btn-hover font-medium mb-4"
            >
              📊 Activity Logs {showActivityLog ? '▼' : '▶'}
            </button>
            
            {showActivityLog && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-fadeIn">
                <div className="space-y-3">
                  {demoActivities.map((activity) => (
                    <div key={activity.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="font-medium text-gray-900 dark:text-white">{activity.activity}</p>
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>By: {activity.user}</span>
                        <span>{activity.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Admin Access</h3>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            You are currently logged in as <strong>{user?.name}</strong> with administrative privileges. 
            This panel allows you to manage users, monitor activities, and configure system settings.
          </p>
        </div>
      </div>
    </RoleBasedRoute>
  );
};

export default AdminPanel;