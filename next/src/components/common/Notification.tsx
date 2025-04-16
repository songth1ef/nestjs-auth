import React from 'react';

interface NotificationProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
}

export const Notification: React.FC<NotificationProps> = ({ type, message }) => {
  const bgColor = {
    error: 'bg-red-50 border-red-200 text-red-600',
    success: 'bg-green-50 border-green-200 text-green-600',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    info: 'bg-blue-50 border-blue-200 text-blue-600',
  };

  return (
    <div className={`${bgColor[type]} border px-4 py-3 rounded`}>
      {message}
    </div>
  );
}; 