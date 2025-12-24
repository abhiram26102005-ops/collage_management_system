/**
 * Faculty Module
 * Handles all faculty-related functionality
 */

import { getCurrentUser, logout, protectPage } from './auth.js';
import { 
  getSubjects, 
  getStudents,
  addAttendance,
  addMarks,
  addAnnouncement,
  getAnnouncements,
  getFaculty
} from './api.js';

// Protect faculty pages
if (!protectPage('faculty')) {
  throw new Error('Access denied');
}

// Initialize faculty module
document.addEventListener('DOMContentLoaded', () => {
  initFaculty();
});

/**
 * Initialize faculty functionality
 */
function initFaculty() {
  const currentUser = getCurrentUser();
  
  // Update faculty name in navbar
  const facultyNameElements = document.querySelectorAll('#faculty-name');
  facultyNameElements.forEach(el => {
    el.textContent = currentUser.name;
  });
  
  // Setup logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  // Load page-specific content
  const pathname = window.location.pathname;
  
  if (pathname.includes('faculty-dashboard.html')) {
    loadFacultyDashboard();
  } else if (pathname.includes('attendance.html')) {
    loadAttendancePage();
  } else if (pathname.includes('marks.html')) {
    loadMarksPage();
  } else if (pathname.includes('announcements.html')) {
    loadAnnouncementsPage();
  }
}

/**
 * Load faculty dashboard
 */
function loadFacultyDashboard() {
  const currentUser = getCurrentUser();
  const subjects = getSubjects().filter(s => s.facultyId === currentUser.id);
  
  // Update welcome name
  document.getElementById('welcome-name').textContent = currentUser.name;
  
  // Update statistics
  document.getElementById('assigned-subjects').textContent = subjects.length;
  
  // Calculate total students (unique students across all subjects)
  const allStudents = getStudents();
  const relevantStudents = allStudents.filter(student => 
    subjects.some(subject => 
      subject.department === student.department && 
      subject.year === student.year
    )
  );
  document.getElementById('total-students').textContent = relevantStudents.length;
  
  document.getElementById('classes-today').textContent = subjects.length;
  document.getElementById('pending-tasks').textContent = '0';
  
  // Load subjects list
  const subjectsList = document.getElementById('subjects-list');
  subjectsList.innerHTML = subjects.map(subject => `
    <div class="subject-item">
      <h3>${subject.name}</h3>
      <p><strong>Code:</strong> ${subject.code}</p>
      <p><strong>Department:</strong> ${subject.department} - Year ${subject.year}</p>
      <p><strong>Credits:</strong> ${subject.credits}</p>
    </div>
  `).join('');
  
  // Load recent announcements
  const announcements = getAnnouncements().slice(0, 5);
  const announcementsList = document.getElementById('recent-announcements');
  
  if (announcements.length > 0) {
    announcementsList.innerHTML = announcements.map(ann => `
      <li>
        <strong>${ann.title}</strong> - ${new Date(ann.date).toLocaleDateString()}
      </li>
    `).join('');
  } else {
    announcementsList.innerHTML = '<li>No announcements yet</li>';
  }
}

/**
 * Load attendance page
 */
function loadAttendancePage() {
  const currentUser = getCurrentUser();
  const subjects = getSubjects().filter(s => s.facultyId === currentUser.id);
  
  // Populate subject dropdown
  const subjectSelect = document.getElementById('select-subject');
  subjectSelect.innerHTML = '<option value="">Select Subject</option>' +
    subjects.map(s => `<option value="${s.code}">${s.name} (${s.code})</option>`).join('');
  
  // Set today's date
  const dateInput = document.getElementById('attendance-date');
  dateInput.valueAsDate = new Date();
  
  // Load students button
  const loadBtn = document.getElementById('load-students-btn');
  loadBtn.addEventListener('click', loadStudentsForAttendance);
  
  // Bulk actions
  document.getElementById('mark-all-present').addEventListener('click', () => markAllAttendance('present'));
  document.getElementById('mark-all-absent').addEventListener('click', () => markAllAttendance('absent'));
  
  // Submit attendance
  document.getElementById('submit-attendance-btn').addEventListener('click', submitAttendance);
}

/**
 * Load students for attendance
 */
function loadStudentsForAttendance() {
  const subjectCode = document.getElementById('select-subject').value;
  const date = document.getElementById('attendance-date').value;
  
  if (!subjectCode || !date) {
    alert('Please select subject and date');
    return;
  }
  
  const subjects = getSubjects();
  const subject = subjects.find(s => s.code === subjectCode);
  
  if (!subject) {
    alert('Subject not found');
    return;
  }
  
  // Get students for this subject
  const students = getStudents().filter(s => 
    s.department === subject.department && 
    s.year === subject.year
  );
  
  // Show attendance section
  document.getElementById('attendance-section').style.display = 'block';
  
  // Load students table
  const tbody = document.getElementById('attendance-table-body');
  tbody.innerHTML = students.map(student => `
    <tr data-student-id="${student.id}">
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.department}</td>
      <td>
        <div class="attendance-toggle">
          <button class="btn btn-success present" onclick="toggleAttendance('${student.id}', 'present')">Present</button>
          <button class="btn btn-danger" onclick="toggleAttendance('${student.id}', 'absent')">Absent</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Toggle attendance status
 */
window.toggleAttendance = function(studentId, status) {
  const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
  const buttons = row.querySelectorAll('button');
  
  buttons.forEach(btn => {
    btn.classList.remove('present', 'absent');
  });
  
  if (status === 'present') {
    buttons[0].classList.add('present');
    row.dataset.status = 'present';
  } else {
    buttons[1].classList.add('absent');
    row.dataset.status = 'absent';
  }
};

/**
 * Mark all attendance
 */
function markAllAttendance(status) {
  const rows = document.querySelectorAll('#attendance-table-body tr');
  rows.forEach(row => {
    const studentId = row.dataset.studentId;
    window.toggleAttendance(studentId, status);
  });
}

/**
 * Submit attendance
 */
function submitAttendance() {
  const subjectCode = document.getElementById('select-subject').value;
  const date = document.getElementById('attendance-date').value;
  const rows = document.querySelectorAll('#attendance-table-body tr');
  
  let attendanceRecords = [];
  
  rows.forEach(row => {
    const studentId = row.dataset.studentId;
    const status = row.dataset.status || 'absent';
    
    attendanceRecords.push({
      studentId,
      subjectCode,
      date,
      status
    });
  });
  
  // Save attendance records
  attendanceRecords.forEach(record => addAttendance(record));
  
  alert('Attendance submitted successfully!');
  document.getElementById('attendance-section').style.display = 'none';
  document.getElementById('select-subject').value = '';
}

/**
 * Load marks page
 */
function loadMarksPage() {
  const currentUser = getCurrentUser();
  const subjects = getSubjects().filter(s => s.facultyId === currentUser.id);
  
  // Populate subject dropdown
  const subjectSelect = document.getElementById('marks-subject');
  subjectSelect.innerHTML = '<option value="">Select Subject</option>' +
    subjects.map(s => `<option value="${s.code}">${s.name} (${s.code})</option>`).join('');
  
  // Load students button
  const loadBtn = document.getElementById('load-marks-students-btn');
  loadBtn.addEventListener('click', loadStudentsForMarks);
  
  // Submit marks
  document.getElementById('submit-marks-btn').addEventListener('click', submitMarks);
}

/**
 * Load students for marks entry
 */
function loadStudentsForMarks() {
  const subjectCode = document.getElementById('marks-subject').value;
  const assessmentType = document.getElementById('assessment-type').value;
  const maxMarks = document.getElementById('max-marks').value;
  
  if (!subjectCode || !assessmentType || !maxMarks) {
    alert('Please fill all fields');
    return;
  }
  
  const subjects = getSubjects();
  const subject = subjects.find(s => s.code === subjectCode);
  
  if (!subject) {
    alert('Subject not found');
    return;
  }
  
  // Get students for this subject
  const students = getStudents().filter(s => 
    s.department === subject.department && 
    s.year === subject.year
  );
  
  // Show marks section
  document.getElementById('marks-section').style.display = 'block';
  
  // Load students table
  const tbody = document.getElementById('marks-table-body');
  tbody.innerHTML = students.map(student => `
    <tr data-student-id="${student.id}">
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.department}</td>
      <td>
        <input type="number" class="marks-input" min="0" max="${maxMarks}" placeholder="0" data-student-id="${student.id}">
      </td>
    </tr>
  `).join('');
}

/**
 * Submit marks
 */
function submitMarks() {
  const subjectCode = document.getElementById('marks-subject').value;
  const assessmentType = document.getElementById('assessment-type').value;
  const maxMarks = document.getElementById('max-marks').value;
  const inputs = document.querySelectorAll('.marks-input');
  
  let marksRecords = [];
  
  inputs.forEach(input => {
    const studentId = input.dataset.studentId;
    const marksObtained = input.value || '0';
    
    marksRecords.push({
      studentId,
      subjectCode,
      assessmentType,
      maxMarks: parseInt(maxMarks),
      marksObtained: parseInt(marksObtained),
      date: new Date().toISOString()
    });
  });
  
  // Save marks records
  marksRecords.forEach(record => addMarks(record));
  
  alert('Marks submitted successfully!');
  document.getElementById('marks-section').style.display = 'none';
  document.getElementById('marks-subject').value = '';
  document.getElementById('assessment-type').value = '';
  document.getElementById('max-marks').value = '';
}

/**
 * Load announcements page
 */
function loadAnnouncementsPage() {
  const currentUser = getCurrentUser();
  const subjects = getSubjects().filter(s => s.facultyId === currentUser.id);
  
  // Populate subject dropdown
  const subjectSelect = document.getElementById('announcement-subject');
  subjectSelect.innerHTML = '<option value="">Select Subject</option>' +
    '<option value="all">All Subjects</option>' +
    subjects.map(s => `<option value="${s.code}">${s.name} (${s.code})</option>`).join('');
  
  // Handle form submission
  const form = document.getElementById('announcement-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('announcement-title').value;
    const subjectCode = document.getElementById('announcement-subject').value;
    const message = document.getElementById('announcement-message').value;
    
    const announcement = {
      title,
      message,
      subjectCode,
      facultyId: currentUser.id,
      facultyName: currentUser.name,
      target: subjectCode === 'all' ? 'all' : 'subject'
    };
    
    addAnnouncement(announcement);
    alert('Announcement posted successfully!');
    form.reset();
    loadAnnouncementsList();
  });
  
  loadAnnouncementsList();
}

/**
 * Load announcements list
 */
function loadAnnouncementsList() {
  const currentUser = getCurrentUser();
  const announcements = getAnnouncements().filter(a => a.facultyId === currentUser.id);
  const announcementsList = document.getElementById('announcements-list');
  
  if (announcements.length > 0) {
    announcementsList.innerHTML = announcements.map(ann => `
      <div class="announcement-item">
        <h3>${ann.title}</h3>
        <div class="announcement-meta">
          <span>📅 ${new Date(ann.date).toLocaleDateString()}</span>
          <span>📚 ${ann.target === 'all' ? 'All Subjects' : ann.subjectCode}</span>
        </div>
        <p>${ann.message}</p>
      </div>
    `).join('');
  } else {
    announcementsList.innerHTML = '<p>No announcements posted yet.</p>';
  }
}
