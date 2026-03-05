const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  // Settings
  getSettings: () => ipcRenderer.invoke('db:getSettings'),
  updateSettings: (path, value) => ipcRenderer.invoke('db:updateSettings', path, value),

  // Courses
  getCourses: () => ipcRenderer.invoke('db:getCourses'),
  updateCourse: (id, updates) => ipcRenderer.invoke('db:updateCourse', id, updates),

  // Assignments
  getAssignments: (courseId) => ipcRenderer.invoke('db:getAssignments', courseId),
  addAssignment: (assignment) => ipcRenderer.invoke('db:addAssignment', assignment),
  updateAssignment: (id, updates) => ipcRenderer.invoke('db:updateAssignment', id, updates),

  // Stats
  getStats: () => ipcRenderer.invoke('db:getStats'),
  updateStats: (updates) => ipcRenderer.invoke('db:updateStats', updates),

  // Schedule
  getScheduleEvents: () => ipcRenderer.invoke('db:getScheduleEvents'),
  addScheduleEvent: (event) => ipcRenderer.invoke('db:addScheduleEvent', event),
  deleteScheduleEvent: (id) => ipcRenderer.invoke('db:deleteScheduleEvent', id),

  // Notifications
  getNotifications: () => ipcRenderer.invoke('db:getNotifications'),
  markNotificationsRead: () => ipcRenderer.invoke('db:markNotificationsRead'),

  // GitHub
  getGithubRepos: () => ipcRenderer.invoke('db:getGithubRepos'),

  // Analytics
  getAnalytics: () => ipcRenderer.invoke('db:getAnalytics'),
});
