/**
 * Student Module
 * Handles all student-related functionality
 */

import { getCurrentUser, logout, protectPage } from './auth.js';
import { 
  getStudents,
  getSubjects,
  getStudentAttendance,
  getStudentMarks,
  getAnnouncements
} from './api.js';

// Protect student pages
if (!protectPage('student')) {
  throw new Error('Access denied');
}

// Initialize student module
document.addEventListener('DOMContentLoaded', () => {
  initStudent();
});

/**
 * Initialize student functionality
 */
function initStudent() {
  const currentUser = getCurrentUser();
  
  // Update student name in navbar
  const studentNameElements = document.querySelectorAll('#student-name');
  studentNameElements.forEach(el => {
    el.textContent = currentUser.name;
  });
  
  // Setup logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  // Load page-specific content
  const pathname = window.location.pathname;
  
  if (pathname.includes('student-dashboard.html')) {
    loadStudentDashboard();
  } else if (pathname.includes('attendance.html')) {
    loadStudentAttendancePage();
  } else if (pathname.includes('marks.html')) {
    loadStudentMarksPage();
  } else if (pathname.includes('timetable.html')) {
    loadTimetablePage();
  } else if (pathname.includes('announcements.html')) {
    loadStudentAnnouncementsPage();
  }
}

/**
 * Load student dashboard
 */
function loadStudentDashboard() {
  const currentUser = getCurrentUser();
  const students = getStudents();
  const student = students.find(s => s.id === currentUser.id);
  
  if (!student) {
    alert('Student profile not found');
    return;
  }
  
  // Update welcome name and profile
  document.getElementById('welcome-name').textContent = student.name;
  document.getElementById('student-id').textContent = student.id;
  document.getElementById('student-dept').textContent = student.department;
  document.getElementById('student-year').textContent = `Year ${student.year}`;
  document.getElementById('student-email').textContent = student.email;
  
  // Get student's subjects
  const subjects = getSubjects().filter(s => 
    s.department === student.department && 
    s.year === student.year
  );
  
  // Calculate attendance
  const attendance = getStudentAttendance(student.id);
  const totalClasses = attendance.length;
  const present = attendance.filter(a => a.status === 'present').length;
  const percentage = totalClasses > 0 ? ((present / totalClasses) * 100).toFixed(2) : 0;
  
  // Update statistics
  document.getElementById('attendance-percentage').textContent = `${percentage}%`;
  document.getElementById('total-subjects').textContent = subjects.length;
  document.getElementById('classes-attended').textContent = present;
  
  // Get announcements count
  const announcements = getAnnouncements();
  document.getElementById('new-announcements').textContent = announcements.length;
  
  // Load subject-wise attendance
  const subjectAttendanceDiv = document.getElementById('subject-attendance');
  subjectAttendanceDiv.innerHTML = subjects.map(subject => {
    const subjectAttendance = attendance.filter(a => a.subjectCode === subject.code);
    const subjectTotal = subjectAttendance.length;
    const subjectPresent = subjectAttendance.filter(a => a.status === 'present').length;
    const subjectPercent = subjectTotal > 0 ? ((subjectPresent / subjectTotal) * 100).toFixed(2) : 0;
    
    return `
      <div class="subject-attendance-item">
        <div>
          <div class="subject-name">${subject.name}</div>
          <small>${subject.code}</small>
        </div>
        <div class="attendance-percent">${subjectPercent}%</div>
      </div>
    `;
  }).join('');
  
  // Load recent announcements
  const recentAnnouncements = announcements.slice(0, 5);
  const announcementsList = document.getElementById('recent-announcements');
  
  if (recentAnnouncements.length > 0) {
    announcementsList.innerHTML = recentAnnouncements.map(ann => `
      <li>
        <strong>${ann.title}</strong> - ${new Date(ann.date).toLocaleDateString()}
      </li>
    `).join('');
  } else {
    announcementsList.innerHTML = '<li>No announcements yet</li>';
  }
}

/**
 * Load student attendance page
 */
function loadStudentAttendancePage() {
  const currentUser = getCurrentUser();
  const students = getStudents();
  const student = students.find(s => s.id === currentUser.id);
  
  if (!student) return;
  
  const subjects = getSubjects().filter(s => 
    s.department === student.department && 
    s.year === student.year
  );
  
  const attendance = getStudentAttendance(student.id);
  const totalClasses = attendance.length;
  const present = attendance.filter(a => a.status === 'present').length;
  const absent = totalClasses - present;
  const percentage = totalClasses > 0 ? ((present / totalClasses) * 100).toFixed(2) : 0;
  
  // Update summary
  document.getElementById('overall-percentage').textContent = `${percentage}%`;
  document.getElementById('total-classes').textContent = totalClasses;
  document.getElementById('present-count').textContent = present;
  document.getElementById('absent-count').textContent = absent;
  
  // Load subject-wise attendance table
  const tbody = document.getElementById('attendance-table-body');
  tbody.innerHTML = subjects.map(subject => {
    const subjectAttendance = attendance.filter(a => a.subjectCode === subject.code);
    const subjectTotal = subjectAttendance.length;
    const subjectPresent = subjectAttendance.filter(a => a.status === 'present').length;
    const subjectAbsent = subjectTotal - subjectPresent;
    const subjectPercent = subjectTotal > 0 ? ((subjectPresent / subjectTotal) * 100).toFixed(2) : 0;
    
    let status = 'Good';
    let statusClass = 'status-good';
    
    if (subjectPercent < 75) {
      status = 'Low';
      statusClass = 'status-danger';
    } else if (subjectPercent < 85) {
      status = 'Average';
      statusClass = 'status-warning';
    }
    
    return `
      <tr>
        <td>${subject.code}</td>
        <td>${subject.name}</td>
        <td>${subjectTotal}</td>
        <td>${subjectPresent}</td>
        <td>${subjectAbsent}</td>
        <td>${subjectPercent}%</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
      </tr>
    `;
  }).join('');
}

/**
 * Load student marks page
 */
function loadStudentMarksPage() {
  const currentUser = getCurrentUser();
  const marks = getStudentMarks(currentUser.id);
  const subjects = getSubjects();
  
  // Load marks table
  const tbody = document.getElementById('marks-table-body');
  
  if (marks.length > 0) {
    tbody.innerHTML = marks.map(mark => {
      const subject = subjects.find(s => s.code === mark.subjectCode);
      const percentage = ((mark.marksObtained / mark.maxMarks) * 100).toFixed(2);
      
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';
      
      return `
        <tr>
          <td>${subject ? subject.name : mark.subjectCode}</td>
          <td>${mark.assessmentType}</td>
          <td>${mark.maxMarks}</td>
          <td>${mark.marksObtained}</td>
          <td>${percentage}%</td>
          <td><strong>${grade}</strong></td>
        </tr>
      `;
    }).join('');
  } else {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No marks available yet</td></tr>';
  }
  
  // Load subject-wise performance
  const performanceDiv = document.getElementById('subject-performance');
  const subjectMarks = {};
  
  marks.forEach(mark => {
    if (!subjectMarks[mark.subjectCode]) {
      subjectMarks[mark.subjectCode] = {
        total: 0,
        obtained: 0,
        count: 0
      };
    }
    subjectMarks[mark.subjectCode].total += mark.maxMarks;
    subjectMarks[mark.subjectCode].obtained += mark.marksObtained;
    subjectMarks[mark.subjectCode].count++;
  });
  
  performanceDiv.innerHTML = Object.keys(subjectMarks).map(code => {
    const subject = subjects.find(s => s.code === code);
    const data = subjectMarks[code];
    const percentage = ((data.obtained / data.total) * 100).toFixed(2);
    
    return `
      <div class="performance-card">
        <h3>${subject ? subject.name : code}</h3>
        <div class="score">${percentage}%</div>
        <p>${data.obtained} / ${data.total} marks</p>
        <p>${data.count} assessments</p>
      </div>
    `;
  }).join('');
}

/**
 * Load timetable page
 */
function loadTimetablePage() {
  const currentUser = getCurrentUser();
  const students = getStudents();
  const student = students.find(s => s.id === currentUser.id);
  
  if (!student) return;
  
  const subjects = getSubjects().filter(s => 
    s.department === student.department && 
    s.year === student.year
  );
  
  // Generate sample timetable
  const timeSlots = [
    '9:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 1:00',
    '1:00 - 2:00',
    '2:00 - 3:00',
    '3:00 - 4:00'
  ];
  
  const tbody = document.getElementById('timetable-body');
  tbody.innerHTML = timeSlots.map((time, index) => {
    if (index === 3) {
      return `
        <tr>
          <td>${time}</td>
          <td colspan="5" class="timetable-slot break">
            <strong>LUNCH BREAK</strong>
          </td>
        </tr>
      `;
    }
    
    return `
      <tr>
        <td>${time}</td>
        ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, dayIndex) => {
          const subjectIndex = (index + dayIndex) % subjects.length;
          const subject = subjects[subjectIndex];
          return subject ? `
            <td>
              <div class="timetable-slot">
                <strong>${subject.name}</strong>
                <small>${subject.code}</small>
              </div>
            </td>
          ` : '<td>-</td>';
        }).join('')}
      </tr>
    `;
  }).join('');
}

/**
 * Load student announcements page
 */
function loadStudentAnnouncementsPage() {
  const currentUser = getCurrentUser();
  const students = getStudents();
  const student = students.find(s => s.id === currentUser.id);
  
  if (!student) return;
  
  const subjects = getSubjects().filter(s => 
    s.department === student.department && 
    s.year === student.year
  );
  
  // Populate filter dropdown
  const filterSelect = document.getElementById('filter-subject');
  filterSelect.innerHTML = '<option value="">All Subjects</option>' +
    subjects.map(s => `<option value="${s.code}">${s.name}</option>`).join('');
  
  // Load announcements
  loadFilteredAnnouncements();
  
  // Setup filter
  filterSelect.addEventListener('change', loadFilteredAnnouncements);
}

/**
 * Load filtered announcements
 */
function loadFilteredAnnouncements() {
  const filterSubject = document.getElementById('filter-subject').value;
  let announcements = getAnnouncements();
  
  if (filterSubject) {
    announcements = announcements.filter(a => 
      a.target === 'all' || a.subjectCode === filterSubject
    );
  }
  
  const container = document.getElementById('announcements-container');
  
  if (announcements.length > 0) {
    container.innerHTML = announcements.map(ann => `
      <div class="announcement-card">
        <h3>${ann.title}</h3>
        <div class="announcement-meta">
          <span>📅 ${new Date(ann.date).toLocaleDateString()}</span>
          <span>👨‍🏫 ${ann.facultyName}</span>
          <span>📚 ${ann.target === 'all' ? 'All Subjects' : ann.subjectCode}</span>
        </div>
        <p>${ann.message}</p>
      </div>
    `).join('');
  } else {
    container.innerHTML = '<p>No announcements available.</p>';
  }
}
