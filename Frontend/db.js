// MongoDB Database Module
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'REDACTED_MONGO_URL/';
const DB_NAME = 'student_learning_db';

let client = null;
let db = null;

async function connect() {
  if (db) return db;
  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('[DB] Connected to MongoDB:', DB_NAME);
  return db;
}

async function disconnect() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

async function getDb() {
  if (!db) await connect();
  return db;
}

// ── Seed data ──────────────────────────────────────────────

const seedSettings = {
  _id: 'user_settings',
  profile: {
    full_name: 'Alex Johnson',
    email: 'alex.johnson@university.edu',
    student_id: 'CS-2023-0047',
    major: 'Computer Science',
    photo_url: ''
  },
  notifications: {
    email_notifications: true,
    push_notifications: true,
    grade_updates: true,
    assignment_reminders: true
  },
  academic: {
    year: '3rd Year',
    gpa_target: 4.0,
    attendance_pct: 78
  },
  security: {
    two_factor_enabled: true,
    active_sessions: []
  },
  app_settings: {
    dark_mode: false
  }
};

const seedCourses = [
  { _id: 'cs201', name: 'Data Structures & Algorithms', code: 'CS201', icon: '🔢', color: '#6366f1', instructor: 'Dr. Sarah Chen', credits: 4, grade: 'A', score: 94, attendance_present: 24, attendance_total: 28, room: 'Science Hall 204', schedule: 'Mon/Wed 10:00-11:30', description: 'Advanced data structures, algorithm design, complexity analysis.', progress: 78, sparkline: [85, 88, 92, 90, 94, 91, 93, 94] },
  { _id: 'cs301', name: 'Machine Learning', code: 'CS301', icon: '🧠', color: '#8b5cf6', instructor: 'Prof. James Liu', credits: 3, grade: 'A-', score: 91, attendance_present: 22, attendance_total: 26, room: 'Tech Center 102', schedule: 'Tue/Thu 14:00-15:30', description: 'Supervised/unsupervised learning, neural networks, deep learning.', progress: 65, sparkline: [78, 82, 85, 88, 91, 89, 90, 91] },
  { _id: 'cs202', name: 'Web Development', code: 'CS202', icon: '🌐', color: '#06b6d4', instructor: 'Dr. Emily Park', credits: 3, grade: 'B+', score: 87, attendance_present: 20, attendance_total: 24, room: 'Digital Arts 301', schedule: 'Mon/Wed/Fri 13:00-14:00', description: 'Full-stack web development with modern frameworks and tools.', progress: 82, sparkline: [80, 83, 82, 85, 87, 86, 88, 87] },
  { _id: 'cs204', name: 'Database Systems', code: 'CS204', icon: '💾', color: '#f59e0b', instructor: 'Prof. Michael Torres', credits: 4, grade: 'A', score: 95, attendance_present: 26, attendance_total: 28, room: 'Engineering 405', schedule: 'Tue/Thu 10:00-11:30', description: 'Relational databases, SQL, normalization, query optimization.', progress: 88, sparkline: [88, 90, 92, 93, 95, 94, 95, 95] },
  { _id: 'cs205', name: 'Computer Networks', code: 'CS205', icon: '🔗', color: '#10b981', instructor: 'Dr. Anna Kim', credits: 3, grade: 'B', score: 83, attendance_present: 18, attendance_total: 24, room: 'Network Lab 110', schedule: 'Wed/Fri 09:00-10:30', description: 'TCP/IP, routing protocols, network security fundamentals.', progress: 55, sparkline: [75, 78, 80, 82, 81, 83, 82, 83] },
];

const seedAssignments = [
  { _id: 'a1', course_id: 'cs201', name: 'Binary Tree Traversal', due: '2026-03-08', status: 'submitted', score: 96, max_score: 100 },
  { _id: 'a2', course_id: 'cs201', name: 'Graph Algorithms Lab', due: '2026-03-15', status: 'pending', score: null, max_score: 100 },
  { _id: 'a3', course_id: 'cs201', name: 'Dynamic Programming Set', due: '2026-03-22', status: 'upcoming', score: null, max_score: 100 },
  { _id: 'a4', course_id: 'cs301', name: 'Linear Regression Project', due: '2026-03-10', status: 'submitted', score: 88, max_score: 100 },
  { _id: 'a5', course_id: 'cs301', name: 'Neural Network Lab', due: '2026-03-18', status: 'in-progress', score: null, max_score: 100 },
  { _id: 'a6', course_id: 'cs202', name: 'React Dashboard', due: '2026-03-05', status: 'submitted', score: 92, max_score: 100 },
  { _id: 'a7', course_id: 'cs202', name: 'API Integration', due: '2026-03-12', status: 'pending', score: null, max_score: 100 },
  { _id: 'a8', course_id: 'cs204', name: 'SQL Query Optimization', due: '2026-03-07', status: 'submitted', score: 98, max_score: 100 },
  { _id: 'a9', course_id: 'cs204', name: 'Database Design Project', due: '2026-03-20', status: 'upcoming', score: null, max_score: 100 },
  { _id: 'a10', course_id: 'cs205', name: 'Wireshark Analysis', due: '2026-03-09', status: 'submitted', score: 80, max_score: 100 },
  { _id: 'a11', course_id: 'cs205', name: 'Socket Programming', due: '2026-03-16', status: 'pending', score: null, max_score: 100 },
];

const seedStats = {
  _id: 'dashboard_stats',
  study_streak: 12,
  study_hours: 48.5,
  pending_assignments: 8,
  class_rank_pct: 5,
  classes_attended: 24,
  classes_total: 28,
  assignments_done: 18,
  assignments_total: 22,
  upcoming_exams: 3,
  current_gpa: 3.72
};

const seedScheduleEvents = [
  { _id: 'ev1', day: 0, start_hour: 10, duration: 1.5, title: 'Data Structures', code: 'CS201', color: '#6366f1', room: 'SH 204' },
  { _id: 'ev2', day: 0, start_hour: 13, duration: 1, title: 'Web Dev', code: 'CS202', color: '#06b6d4', room: 'DA 301' },
  { _id: 'ev3', day: 1, start_hour: 10, duration: 1.5, title: 'Database Systems', code: 'CS204', color: '#f59e0b', room: 'ENG 405' },
  { _id: 'ev4', day: 1, start_hour: 14, duration: 1.5, title: 'Machine Learning', code: 'CS301', color: '#8b5cf6', room: 'TC 102' },
  { _id: 'ev5', day: 2, start_hour: 9, duration: 1.5, title: 'Computer Networks', code: 'CS205', color: '#10b981', room: 'NL 110' },
  { _id: 'ev6', day: 2, start_hour: 10, duration: 1.5, title: 'Data Structures', code: 'CS201', color: '#6366f1', room: 'SH 204' },
  { _id: 'ev7', day: 2, start_hour: 13, duration: 1, title: 'Web Dev', code: 'CS202', color: '#06b6d4', room: 'DA 301' },
  { _id: 'ev8', day: 3, start_hour: 10, duration: 1.5, title: 'Database Systems', code: 'CS204', color: '#f59e0b', room: 'ENG 405' },
  { _id: 'ev9', day: 3, start_hour: 14, duration: 1.5, title: 'Machine Learning', code: 'CS301', color: '#8b5cf6', room: 'TC 102' },
  { _id: 'ev10', day: 4, start_hour: 9, duration: 1.5, title: 'Computer Networks', code: 'CS205', color: '#10b981', room: 'NL 110' },
  { _id: 'ev11', day: 4, start_hour: 13, duration: 1, title: 'Web Dev', code: 'CS202', color: '#06b6d4', room: 'DA 301' },
];

const seedNotifications = [
  { _id: 'n1', text: 'Assignment "ML Project" due tomorrow', time: '2h ago', unread: true, created_at: new Date() },
  { _id: 'n2', text: 'New grade posted for Data Structures', time: '4h ago', unread: true, created_at: new Date() },
  { _id: 'n3', text: 'Study group session at 3 PM', time: '6h ago', unread: false, created_at: new Date() },
  { _id: 'n4', text: 'Course material updated for Algorithms', time: '1d ago', unread: false, created_at: new Date() },
];

const seedGithubRepos = [
  {
    _id: 'repo1', name: 'ml-project', desc: 'Machine learning algorithms and neural network implementations',
    lang: 'Python', lang_color: '#3572A5', stars: 12, forks: 3, status: 'active',
    activity: [2, 5, 3, 8, 6, 1, 4, 7, 3, 9, 2, 5, 8, 4, 6, 3, 7, 2, 5, 9],
    commits: [
      { sha: 'a3f7c2d', msg: 'Add neural network backpropagation', time: '2h ago', additions: 142, deletions: 23 },
      { sha: 'e9b1f5a', msg: 'Fix gradient descent convergence', time: '5h ago', additions: 38, deletions: 12 },
      { sha: 'c4d8e2f', msg: 'Update data preprocessing pipeline', time: '1d ago', additions: 85, deletions: 41 },
      { sha: 'f1a3b7c', msg: 'Add model evaluation metrics', time: '2d ago', additions: 63, deletions: 8 },
    ]
  },
  {
    _id: 'repo2', name: 'web-dashboard', desc: 'Student learning dashboard built with React and Node.js',
    lang: 'JavaScript', lang_color: '#f1e05a', stars: 8, forks: 1, status: 'review',
    activity: [1, 0, 4, 2, 6, 3, 0, 5, 2, 7, 1, 3, 6, 2, 4, 0, 5, 3, 1, 8],
    commits: [
      { sha: 'b2c9d4e', msg: 'Implement dark mode toggle', time: '3h ago', additions: 94, deletions: 17 },
      { sha: 'd5e7f1a', msg: 'Add chart components', time: '8h ago', additions: 156, deletions: 32 },
      { sha: 'a1b3c5d', msg: 'Fix responsive layout issues', time: '1d ago', additions: 45, deletions: 28 },
    ]
  },
  {
    _id: 'repo3', name: 'algo-practice', desc: 'Data structures and algorithm solutions for competitive programming',
    lang: 'C++', lang_color: '#f34b7d', stars: 5, forks: 0, status: 'idle',
    activity: [0, 1, 0, 2, 0, 0, 3, 1, 0, 0, 2, 1, 0, 3, 0, 1, 0, 0, 2, 0],
    commits: [
      { sha: 'g8h2i4j', msg: 'Add binary tree solutions', time: '3d ago', additions: 78, deletions: 0 },
      { sha: 'k5l7m9n', msg: 'Graph traversal algorithms', time: '5d ago', additions: 124, deletions: 15 },
    ]
  },
];

async function seedDatabase() {
  const database = await getDb();

  // Settings
  const settingsCol = database.collection('settings');
  const existingSettings = await settingsCol.findOne({ _id: 'user_settings' });
  if (!existingSettings) {
    await settingsCol.insertOne(seedSettings);
    console.log('[DB] Seeded settings');
  }

  // Courses
  const coursesCol = database.collection('courses');
  const courseCount = await coursesCol.countDocuments();
  if (courseCount === 0) {
    await coursesCol.insertMany(seedCourses);
    console.log('[DB] Seeded courses');
  }

  // Assignments
  const assignmentsCol = database.collection('assignments');
  const assignCount = await assignmentsCol.countDocuments();
  if (assignCount === 0) {
    await assignmentsCol.insertMany(seedAssignments);
    console.log('[DB] Seeded assignments');
  }

  // Stats
  const statsCol = database.collection('stats');
  const existingStats = await statsCol.findOne({ _id: 'dashboard_stats' });
  if (!existingStats) {
    await statsCol.insertOne(seedStats);
    console.log('[DB] Seeded stats');
  }

  // Schedule events
  const eventsCol = database.collection('schedule_events');
  const eventCount = await eventsCol.countDocuments();
  if (eventCount === 0) {
    await eventsCol.insertMany(seedScheduleEvents);
    console.log('[DB] Seeded schedule events');
  }

  // Notifications
  const notifsCol = database.collection('notifications');
  const notifCount = await notifsCol.countDocuments();
  if (notifCount === 0) {
    await notifsCol.insertMany(seedNotifications);
    console.log('[DB] Seeded notifications');
  }

  // GitHub repos
  const reposCol = database.collection('github_repos');
  const repoCount = await reposCol.countDocuments();
  if (repoCount === 0) {
    await reposCol.insertMany(seedGithubRepos);
    console.log('[DB] Seeded github repos');
  }

  console.log('[DB] Seed complete');
}

// ── Query helpers ────────────────────────────────────────────

async function getSettings() {
  const database = await getDb();
  return database.collection('settings').findOne({ _id: 'user_settings' });
}

async function updateSettings(path, value) {
  const database = await getDb();
  return database.collection('settings').updateOne(
    { _id: 'user_settings' },
    { $set: { [path]: value } }
  );
}

async function getCourses() {
  const database = await getDb();
  return database.collection('courses').find().toArray();
}

async function updateCourse(courseId, updates) {
  const database = await getDb();
  return database.collection('courses').updateOne(
    { _id: courseId },
    { $set: updates }
  );
}

async function getAssignments(courseId) {
  const database = await getDb();
  const filter = courseId ? { course_id: courseId } : {};
  return database.collection('assignments').find(filter).sort({ due: 1 }).toArray();
}

async function addAssignment(assignment) {
  const database = await getDb();
  assignment._id = 'a' + Date.now();
  return database.collection('assignments').insertOne(assignment);
}

async function updateAssignment(assignmentId, updates) {
  const database = await getDb();
  return database.collection('assignments').updateOne(
    { _id: assignmentId },
    { $set: updates }
  );
}

async function getStats() {
  const database = await getDb();
  return database.collection('stats').findOne({ _id: 'dashboard_stats' });
}

async function updateStats(updates) {
  const database = await getDb();
  return database.collection('stats').updateOne(
    { _id: 'dashboard_stats' },
    { $set: updates }
  );
}

async function getScheduleEvents() {
  const database = await getDb();
  return database.collection('schedule_events').find().sort({ day: 1, start_hour: 1 }).toArray();
}

async function addScheduleEvent(event) {
  const database = await getDb();
  event._id = 'ev' + Date.now();
  return database.collection('schedule_events').insertOne(event);
}

async function deleteScheduleEvent(eventId) {
  const database = await getDb();
  return database.collection('schedule_events').deleteOne({ _id: eventId });
}

async function getNotifications() {
  const database = await getDb();
  return database.collection('notifications').find().sort({ created_at: -1 }).toArray();
}

async function markNotificationsRead() {
  const database = await getDb();
  return database.collection('notifications').updateMany(
    { unread: true },
    { $set: { unread: false } }
  );
}

async function getGithubRepos() {
  const database = await getDb();
  return database.collection('github_repos').find().toArray();
}

async function getAnalytics() {
  const database = await getDb();
  const courses = await database.collection('courses').find().toArray();
  const assignments = await database.collection('assignments').find().toArray();
  const stats = await database.collection('stats').findOne({ _id: 'dashboard_stats' });

  const totalCredits = courses.reduce((a, c) => a + c.credits, 0);
  const avgScore = courses.length > 0
    ? (courses.reduce((a, c) => a + c.score, 0) / courses.length).toFixed(1)
    : 0;
  const submittedAssignments = assignments.filter(a => a.status === 'submitted');
  const avgAssignmentScore = submittedAssignments.length > 0
    ? (submittedAssignments.reduce((a, x) => a + (x.score || 0), 0) / submittedAssignments.length).toFixed(1)
    : 0;

  const coursePerformance = courses.map(c => {
    const courseAssignments = assignments.filter(a => a.course_id === c._id);
    const submitted = courseAssignments.filter(a => a.status === 'submitted');
    const avgGrade = submitted.length > 0
      ? (submitted.reduce((a, x) => a + (x.score || 0), 0) / submitted.length).toFixed(1)
      : null;
    return {
      name: c.name,
      code: c.code,
      color: c.color,
      icon: c.icon,
      score: c.score,
      attendance_pct: c.attendance_total > 0
        ? Math.round((c.attendance_present / c.attendance_total) * 100)
        : 0,
      avg_assignment: avgGrade,
      total_assignments: courseAssignments.length,
      submitted_assignments: submitted.length,
    };
  });

  return {
    total_credits: totalCredits,
    avg_score: avgScore,
    total_courses: courses.length,
    avg_assignment_score: avgAssignmentScore,
    gpa: stats?.current_gpa || 0,
    study_hours: stats?.study_hours || 0,
    study_streak: stats?.study_streak || 0,
    course_performance: coursePerformance,
    assignment_breakdown: {
      submitted: assignments.filter(a => a.status === 'submitted').length,
      pending: assignments.filter(a => a.status === 'pending').length,
      in_progress: assignments.filter(a => a.status === 'in-progress').length,
      upcoming: assignments.filter(a => a.status === 'upcoming').length,
    }
  };
}

module.exports = {
  connect,
  disconnect,
  seedDatabase,
  getSettings,
  updateSettings,
  getCourses,
  updateCourse,
  getAssignments,
  addAssignment,
  updateAssignment,
  getStats,
  updateStats,
  getScheduleEvents,
  addScheduleEvent,
  deleteScheduleEvent,
  getNotifications,
  markNotificationsRead,
  getGithubRepos,
  getAnalytics,
};
