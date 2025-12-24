/**
 * API Module - Mock Data Management
 * Simulates backend API calls using localStorage
 */

/**
 * Initialize mock database with sample data
 */
export function initializeDatabase() {
  // Check if data already exists
  if (!localStorage.getItem('students')) {
    // Initialize students
    const students = [
      { id: 'STU001', name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '9876543210', department: 'CSE', year: '3', username: 'student1', password: 'student123' },
      { id: 'STU002', name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543211', department: 'CSE', year: '3', username: 'student2', password: 'student123' },
      { id: 'STU003', name: 'Amit Patel', email: 'amit@example.com', phone: '9876543212', department: 'ECE', year: '2', username: 'student3', password: 'student123' },
      { id: 'STU004', name: 'Sneha Reddy', email: 'sneha@example.com', phone: '9876543213', department: 'MECH', year: '4', username: 'student4', password: 'student123' },
      { id: 'STU005', name: 'Vikram Singh', email: 'vikram@example.com', phone: '9876543214', department: 'CIVIL', year: '1', username: 'student5', password: 'student123' }
    ];
    localStorage.setItem('students', JSON.stringify(students));
    
    // Initialize faculty
    const faculty = [
      { id: 'FAC001', name: 'Dr. Ramesh Verma', email: 'ramesh@example.com', phone: '9876543220', department: 'CSE', designation: 'Professor', username: 'faculty1', password: 'faculty123' },
      { id: 'FAC002', name: 'Dr. Sunita Gupta', email: 'sunita@example.com', phone: '9876543221', department: 'ECE', designation: 'Associate Professor', username: 'faculty2', password: 'faculty123' },
      { id: 'FAC003', name: 'Prof. Anil Kumar', email: 'anil@example.com', phone: '9876543222', department: 'MECH', designation: 'Assistant Professor', username: 'faculty3', password: 'faculty123' },
      { id: 'FAC004', name: 'Dr. Kavita Joshi', email: 'kavita@example.com', phone: '9876543223', department: 'CIVIL', designation: 'Lecturer', username: 'faculty4', password: 'faculty123' }
    ];
    localStorage.setItem('faculty', JSON.stringify(faculty));
    
    // Initialize subjects
    const subjects = [
      { code: 'CS301', name: 'Data Structures', department: 'CSE', year: '3', credits: 4, facultyId: 'FAC001' },
      { code: 'CS302', name: 'Database Systems', department: 'CSE', year: '3', credits: 4, facultyId: 'FAC001' },
      { code: 'EC201', name: 'Digital Electronics', department: 'ECE', year: '2', credits: 4, facultyId: 'FAC002' },
      { code: 'ME401', name: 'Thermodynamics', department: 'MECH', year: '4', credits: 3, facultyId: 'FAC003' },
      { code: 'CE101', name: 'Engineering Mechanics', department: 'CIVIL', year: '1', credits: 4, facultyId: 'FAC004' }
    ];
    localStorage.setItem('subjects', JSON.stringify(subjects));
    
    // Initialize admin user
    const admin = { username: 'admin', password: 'admin123', role: 'admin', name: 'System Administrator' };
    
    // Initialize users array
    const users = [
      admin,
      ...students.map(s => ({ username: s.username, password: s.password, role: 'student', id: s.id, name: s.name })),
      ...faculty.map(f => ({ username: f.username, password: f.password, role: 'faculty', id: f.id, name: f.name }))
    ];
    localStorage.setItem('users', JSON.stringify(users));
    
    // Initialize attendance records
    const attendance = [];
    localStorage.setItem('attendance', JSON.stringify(attendance));
    
    // Initialize marks records
    const marks = [];
    localStorage.setItem('marks', JSON.stringify(marks));
    
    // Initialize announcements
    const announcements = [];
    localStorage.setItem('announcements', JSON.stringify(announcements));
  }
}

// Initialize database on module load
initializeDatabase();

/**
 * Get all users
 */
export function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

/**
 * Set current logged-in user
 */
export function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Get current logged-in user
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Student Management
 */
export function getStudents() {
  return JSON.parse(localStorage.getItem('students') || '[]');
}

export function addStudent(student) {
  const students = getStudents();
  students.push(student);
  localStorage.setItem('students', JSON.stringify(students));
  
  // Also add to users
  const users = getUsers();
  users.push({
    username: student.username || student.id.toLowerCase(),
    password: 'student123',
    role: 'student',
    id: student.id,
    name: student.name
  });
  localStorage.setItem('users', JSON.stringify(users));
}

export function updateStudent(id, updatedStudent) {
  const students = getStudents();
  const index = students.findIndex(s => s.id === id);
  if (index !== -1) {
    students[index] = { ...students[index], ...updatedStudent };
    localStorage.setItem('students', JSON.stringify(students));
  }
}

export function deleteStudent(id) {
  const students = getStudents().filter(s => s.id !== id);
  localStorage.setItem('students', JSON.stringify(students));
}

/**
 * Faculty Management
 */
export function getFaculty() {
  return JSON.parse(localStorage.getItem('faculty') || '[]');
}

export function addFaculty(faculty) {
  const facultyList = getFaculty();
  facultyList.push(faculty);
  localStorage.setItem('faculty', JSON.stringify(facultyList));
  
  // Also add to users
  const users = getUsers();
  users.push({
    username: faculty.username || faculty.id.toLowerCase(),
    password: 'faculty123',
    role: 'faculty',
    id: faculty.id,
    name: faculty.name
  });
  localStorage.setItem('users', JSON.stringify(users));
}

export function updateFaculty(id, updatedFaculty) {
  const facultyList = getFaculty();
  const index = facultyList.findIndex(f => f.id === id);
  if (index !== -1) {
    facultyList[index] = { ...facultyList[index], ...updatedFaculty };
    localStorage.setItem('faculty', JSON.stringify(facultyList));
  }
}

export function deleteFaculty(id) {
  const facultyList = getFaculty().filter(f => f.id !== id);
  localStorage.setItem('faculty', JSON.stringify(facultyList));
}

/**
 * Subject Management
 */
export function getSubjects() {
  return JSON.parse(localStorage.getItem('subjects') || '[]');
}

export function addSubject(subject) {
  const subjects = getSubjects();
  subjects.push(subject);
  localStorage.setItem('subjects', JSON.stringify(subjects));
}

export function updateSubject(code, updatedSubject) {
  const subjects = getSubjects();
  const index = subjects.findIndex(s => s.code === code);
  if (index !== -1) {
    subjects[index] = { ...subjects[index], ...updatedSubject };
    localStorage.setItem('subjects', JSON.stringify(subjects));
  }
}

export function deleteSubject(code) {
  const subjects = getSubjects().filter(s => s.code !== code);
  localStorage.setItem('subjects', JSON.stringify(subjects));
}

/**
 * Attendance Management
 */
export function getAttendance() {
  return JSON.parse(localStorage.getItem('attendance') || '[]');
}

export function addAttendance(attendanceRecord) {
  const attendance = getAttendance();
  attendance.push(attendanceRecord);
  localStorage.setItem('attendance', JSON.stringify(attendance));
}

export function getStudentAttendance(studentId) {
  return getAttendance().filter(a => a.studentId === studentId);
}

export function getSubjectAttendance(subjectCode) {
  return getAttendance().filter(a => a.subjectCode === subjectCode);
}

/**
 * Marks Management
 */
export function getMarks() {
  return JSON.parse(localStorage.getItem('marks') || '[]');
}

export function addMarks(marksRecord) {
  const marks = getMarks();
  marks.push(marksRecord);
  localStorage.setItem('marks', JSON.stringify(marks));
}

export function getStudentMarks(studentId) {
  return getMarks().filter(m => m.studentId === studentId);
}

export function getSubjectMarks(subjectCode) {
  return getMarks().filter(m => m.subjectCode === subjectCode);
}

/**
 * Announcements Management
 */
export function getAnnouncements() {
  return JSON.parse(localStorage.getItem('announcements') || '[]');
}

export function addAnnouncement(announcement) {
  const announcements = getAnnouncements();
  announcement.id = Date.now().toString();
  announcement.date = new Date().toISOString();
  announcements.unshift(announcement);
  localStorage.setItem('announcements', JSON.stringify(announcements));
}

export function getAnnouncementsForStudent(studentDepartment, studentYear) {
  return getAnnouncements().filter(a => 
    a.target === 'all' || 
    (a.department === studentDepartment && a.year === studentYear)
  );
}

/**
 * Statistics
 */
export function getStatistics() {
  return {
    totalStudents: getStudents().length,
    totalFaculty: getFaculty().length,
    totalSubjects: getSubjects().length,
    totalDepartments: new Set(getStudents().map(s => s.department)).size
  };
}
