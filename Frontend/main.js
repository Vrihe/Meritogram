const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#f8fafc',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile('renderer/index.html');
}

// ── IPC Handlers ──────────────────────────────────────────

// Settings
ipcMain.handle('db:getSettings', async () => {
  return db.getSettings();
});
ipcMain.handle('db:updateSettings', async (_e, path, value) => {
  await db.updateSettings(path, value);
  return db.getSettings();
});

// Courses
ipcMain.handle('db:getCourses', async () => {
  return db.getCourses();
});
ipcMain.handle('db:updateCourse', async (_e, courseId, updates) => {
  await db.updateCourse(courseId, updates);
  return db.getCourses();
});

// Assignments
ipcMain.handle('db:getAssignments', async (_e, courseId) => {
  return db.getAssignments(courseId);
});
ipcMain.handle('db:addAssignment', async (_e, assignment) => {
  await db.addAssignment(assignment);
  return db.getAssignments(assignment.course_id);
});
ipcMain.handle('db:updateAssignment', async (_e, assignmentId, updates) => {
  await db.updateAssignment(assignmentId, updates);
  return true;
});

// Stats
ipcMain.handle('db:getStats', async () => {
  return db.getStats();
});
ipcMain.handle('db:updateStats', async (_e, updates) => {
  await db.updateStats(updates);
  return db.getStats();
});

// Schedule
ipcMain.handle('db:getScheduleEvents', async () => {
  return db.getScheduleEvents();
});
ipcMain.handle('db:addScheduleEvent', async (_e, event) => {
  await db.addScheduleEvent(event);
  return db.getScheduleEvents();
});
ipcMain.handle('db:deleteScheduleEvent', async (_e, eventId) => {
  await db.deleteScheduleEvent(eventId);
  return db.getScheduleEvents();
});

// Notifications
ipcMain.handle('db:getNotifications', async () => {
  return db.getNotifications();
});
ipcMain.handle('db:markNotificationsRead', async () => {
  await db.markNotificationsRead();
  return db.getNotifications();
});

// GitHub
ipcMain.handle('db:getGithubRepos', async () => {
  return db.getGithubRepos();
});

// Analytics
ipcMain.handle('db:getAnalytics', async () => {
  return db.getAnalytics();
});

// ── App lifecycle ─────────────────────────────────────────

app.whenReady().then(async () => {
  try {
    await db.connect();
    await db.seedDatabase();
  } catch (err) {
    console.error('[DB] Failed to connect/seed:', err.message);
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    db.disconnect();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => {
  db.disconnect();
});
