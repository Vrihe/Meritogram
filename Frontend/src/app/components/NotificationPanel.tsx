import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { api } from '../services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  data?: any;
}

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/notifications');
      setNotifications(response.notifications || []);
      setUnreadCount(response.unread_count || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'profile_change_request':
        return 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800';
      case 'profile_change_approved':
        return 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800';
      case 'profile_change_rejected':
        return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800';
      case 'grade':
        return 'bg-indigo-100 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-800';
      default:
        return 'bg-gray-100 dark:bg-[#130d26] border-gray-300 dark:border-[#1a132e]';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-[#1a132e] rounded-lg transition-colors text-gray-700 dark:text-gray-300"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-[#422beb] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-[#0c0814] rounded-lg shadow-lg border border-gray-200 dark:border-[#1a132e] z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-[#1a132e]">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={markAllAsRead}
                  className="text-sm dark:text-gray-300 dark:hover:bg-[#1a132e]"
                >
                  Mark all as read
                </Button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#1a132e] text-gray-500 dark:text-gray-400 rounded"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-[#1a132e]">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`block p-4 m-0 rounded-none border-0 border-b border-gray-200 dark:border-[#1a132e] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#130d26] transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-[#130d26]/50' : 'bg-transparent dark:bg-transparent'
                    } ${getNotificationColor(notification.type)}`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{notification.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[#422beb] rounded-full mt-2 shadow-[0_0_8px_#422beb]"></div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
