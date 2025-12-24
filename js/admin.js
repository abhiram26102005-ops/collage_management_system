/**
 * Admin Module
 * Handles all admin-related functionality
 */

import { getCurrentUser, logout, protectPage } from './auth.js';
import { 
  getStudents, 
  addStudent, 
  deleteStudent,
  getFaculty,
  addFaculty,
  deleteFaculty,
  getSubjects,
  addSubject,
  deleteSubject,
  getStatistics,
  getAttendance
} from './api.js';

// Protect admin pages
if (!protectPage('admin')) {
  throw new Error('Access denied');
}

// Initialize admin module
document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

/**
 * Initialize admin functionality
 */
function initAdmin() {
  const currentUser = getCurrentUser();
  
  // Update admin name in navbar
  const adminNameElements = document.querySelectorAll('#admin-name');
  adminNameElements.forEach(el => {
    el.textContent = currentUser.name;
  });
  
  // Setup logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  // Load page-specific content
  const pathname = window.location.pathname;
  
  if (pathname.includes('admin-dashboard.html')) {
    loadDashboard();
  } else if (pathname.includes('manage-students.html')) {
    loadStudentsPage();
  } else if (pathname.includes('manage-faculty.html')) {
    loadFacultyPage();
  } else if (pathname.includes('manage-subjects.html')) {
    loadSubjectsPage();
  } else if (pathname.includes('reports.html')) {
    loadReportsPage();
  }
}

/**
 * Load admin dashboard
 */
function loadDashboard() {
  const stats = getStatistics();
  
  // Update statistics
  document.getElementById('total-students').textContent = stats.totalStudents;
  document.getElementById('total-faculty').textContent = stats.totalFaculty;
  document.getElementById('total-subjects').textContent = stats.totalSubjects;
  document.getElementById('total-departments').textContent = stats.totalDepartments;
  
  // Load recent activities
  const activitiesList = document.getElementById('recent-activities');
  activitiesList.innerHTML = `
    <li>System initialized successfully</li>
    <li>${stats.totalStudents} students registered</li>
    <li>${stats.totalFaculty} faculty members added</li>
    <li>${stats.totalSubjects} subjects created</li>
  `;
}

/**
 * Load students management page
 */
function loadStudentsPage() {
  loadStudentsTable();
  
  // Setup add student button
  const addBtn = document.getElementById('add-student-btn');
  const formModal = document.getElementById('add-student-form');
  const closeBtn = document.getElementById('close-form-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const studentForm = document.getElementById('student-form');
  
  addBtn.addEventListener('click', () => {
    formModal.style.display = 'flex';
  });
  
  closeBtn.addEventListener('click', () => {
    formModal.style.display = 'none';
    studentForm.reset();
  });
  
  cancelBtn.addEventListener('click', () => {
    formModal.style.display = 'none';
    studentForm.reset();
  });
  
  studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const student = {
      id: document.getElementById('student-id').value,
      name: document.getElementById('student-name').value,
      email: document.getElementById('student-email').value,
      phone: document.getElementById('student-phone').value,
      department: document.getElementById('student-department').value,
      year: document.getElementById('student-year').value,
      username: document.getElementById('student-id').value.toLowerCase(),
      password: 'student123'
    };
    
    addStudent(student);
    formModal.style.display = 'none';
    studentForm.reset();
    loadStudentsTable();
    alert('Student added successfully!');
  });
  
  // Setup search and filter
  const searchInput = document.getElementById('search-student');
  const filterDept = document.getElementById('filter-department');
  
  searchInput.addEventListener('input', () => loadStudentsTable());
  filterDept.addEventListener('change', () => loadStudentsTable());
}

/**
 * Load students table
 */
function loadStudentsTable() {
  const tbody = document.getElementById('students-table-body');
  let students = getStudents();
  
  // Apply filters
  const searchTerm = document.getElementById('search-student')?.value.toLowerCase() || '';
  const filterDept = document.getElementById('filter-department')?.value || '';
  
  if (searchTerm) {
    students = students.filter(s => 
      s.name.toLowerCase().includes(searchTerm) ||
      s.id.toLowerCase().includes(searchTerm) ||
      s.email.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filterDept) {
    students = students.filter(s => s.department === filterDept);
  }
  
  tbody.innerHTML = students.map(student => `
    <tr>
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.phone}</td>
      <td>${student.department}</td>
      <td>Year ${student.year}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-danger" onclick="deleteStudentHandler('${student.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Delete student handler
 */
window.deleteStudentHandler = function(id) {
  if (confirm('Are you sure you want to delete this student?')) {
    deleteStudent(id);
    loadStudentsTable();
    alert('Student deleted successfully!');
  }
};

/**
 * Load faculty management page
 */
function loadFacultyPage() {
  loadFacultyTable();
  
  // Setup add faculty button
  const addBtn = document.getElementById('add-faculty-btn');
  const formModal = document.getElementById('add-faculty-form');
  const closeBtn = document.getElementById('close-form-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const facultyForm = document.getElementById('faculty-form');
  
  addBtn.addEventListener('click', () => {
    formModal.style.display = 'flex';
  });
  
  closeBtn.addEventListener('click', () => {
    formModal.style.display = 'none';
    facultyForm.reset();
  });
  
  cancelBtn.addEventListener('click', () => {
    formModal.style.display = 'none';
    facultyForm.reset();
  });
  
  facultyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const faculty = {
      id: document.getElementById('faculty-id').value,
      name: document.getElementById('faculty-name').value,
      email: document.getElementById('faculty-email').value,
      phone: document.getElementById('faculty-phone').value,
      department: document.getElementById('faculty-department').value,
      designation: document.getElementById('faculty-designation').value,
      username: document.getElementById('faculty-id').value.toLowerCase(),
      password: 'faculty123'
    };
    
    addFaculty(faculty);
    formModal.style.display = 'none';
    facultyForm.reset();
    loadFacultyTable();
    alert('Faculty added successfully!');
  });
  
  // Setup search and filter
  const searchInput = document.getElementById('search-faculty');
  const filterDept = document.getElementById('filter-department');
  
  searchInput.addEventListener('input', () => loadFacultyTable());
  filterDept.addEventListener('change', () => loadFacultyTable());
}

/**
 * Load faculty table
 */
function loadFacultyTable() {
  const tbody = document.getElementById('faculty-table-body');
  let faculty = getFaculty();
  
  // Apply filters
  const searchTerm = document.getElementById('search-faculty')?.value.toLowerCase() || '';
  const filterDept = document.getElementById('filter-department')?.value || '';
  
  if (searchTerm) {
    faculty = faculty.filter(f => 
      f.name.toLowerCase().includes(searchTerm) ||
      f.id.toLowerCase().includes(searchTerm) ||
      f.email.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filterDept) {
    faculty = faculty.filter(f => f.department === filterDept);
  }
  
  tbody.innerHTML = faculty.map(fac => `
    <tr>
      <td>${fac.id}</td>
      <td>${fac.name}</td>
      <td>${fac.email}</td>
      <td>${fac.phone}</td>
      <td>${fac.department}</td>
      <td>${fac.designation}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-danger" onclick="deleteFacultyHandler('${fac.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Delete faculty handler
 */
window.deleteFacultyHandler = function(id) {
  if (confirm('Are you sure you want to delete this faculty member?')) {
    deleteFaculty(id);
    loadFacultyTable();
    alert('Faculty deleted successfully!');
  }
};

/**
 * Load subjects management page
 */
function loadSubjectsPage() {
  loadSubjectsTable();
  loadFacultyDropdown();
  
  // Setup add subject button
  const addBtn = document.getElementById('add-subject-btn');
  const formModal = document.getElementById('add-subject-form');
  const closeBtn = document.getElementById('close-form-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const subjectForm = document.getElementById('subject-form');
  
  addBtn.addEventListener('click', () => {
    formModal.style.display = 'flex';
  });
  
  closeBtn.addEventListener('click', () => {
    formModal.style.display = 'none';
    subjectForm.reset();
  });
  
  cancelBtn.addEventListener('click', () => {
    formModal.style.display = 'none';
    subjectForm.reset();
  });
  
  subjectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const subject = {
      code: document.getElementById('subject-code').value,
      name: document.getElementById('subject-name').value,
      department: document.getElementById('subject-department').value,
      year: document.getElementById('subject-year').value,
      credits: document.getElementById('subject-credits').value,
      facultyId: document.getElementById('subject-faculty').value
    };
    
    addSubject(subject);
    formModal.style.display = 'none';
    subjectForm.reset();
    loadSubjectsTable();
    alert('Subject added successfully!');
  });
  
  // Setup search and filter
  const searchInput = document.getElementById('search-subject');
  const filterDept = document.getElementById('filter-department');
  
  searchInput.addEventListener('input', () => loadSubjectsTable());
  filterDept.addEventListener('change', () => loadSubjectsTable());
}

/**
 * Load faculty dropdown
 */
function loadFacultyDropdown() {
  const select = document.getElementById('subject-faculty');
  const faculty = getFaculty();
  
  select.innerHTML = '<option value="">Select Faculty</option>' + 
    faculty.map(f => `<option value="${f.id}">${f.name} (${f.department})</option>`).join('');
}

/**
 * Load subjects table
 */
function loadSubjectsTable() {
  const tbody = document.getElementById('subjects-table-body');
  let subjects = getSubjects();
  const faculty = getFaculty();
  
  // Apply filters
  const searchTerm = document.getElementById('search-subject')?.value.toLowerCase() || '';
  const filterDept = document.getElementById('filter-department')?.value || '';
  
  if (searchTerm) {
    subjects = subjects.filter(s => 
      s.name.toLowerCase().includes(searchTerm) ||
      s.code.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filterDept) {
    subjects = subjects.filter(s => s.department === filterDept);
  }
  
  tbody.innerHTML = subjects.map(subject => {
    const fac = faculty.find(f => f.id === subject.facultyId);
    return `
      <tr>
        <td>${subject.code}</td>
        <td>${subject.name}</td>
        <td>${subject.department}</td>
        <td>Year ${subject.year}</td>
        <td>${subject.credits}</td>
        <td>${fac ? fac.name : 'Not Assigned'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-danger" onclick="deleteSubjectHandler('${subject.code}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Delete subject handler
 */
window.deleteSubjectHandler = function(code) {
  if (confirm('Are you sure you want to delete this subject?')) {
    deleteSubject(code);
    loadSubjectsTable();
    alert('Subject deleted successfully!');
  }
};

/**
 * Load reports page
 */
function loadReportsPage() {
  const generateBtn = document.getElementById('generate-report-btn');
  
  generateBtn.addEventListener('click', () => {
    generateAttendanceReport();
  });
}

/**
 * Generate attendance report
 */
function generateAttendanceReport() {
  const tbody = document.getElementById('attendance-report-body');
  const students = getStudents();
  const attendance = getAttendance();
  
  const filterDept = document.getElementById('report-department').value;
  const filterYear = document.getElementById('report-year').value;
  
  let filteredStudents = students;
  
  if (filterDept) {
    filteredStudents = filteredStudents.filter(s => s.department === filterDept);
  }
  
  if (filterYear) {
    filteredStudents = filteredStudents.filter(s => s.year === filterYear);
  }
  
  tbody.innerHTML = filteredStudents.map(student => {
    const studentAttendance = attendance.filter(a => a.studentId === student.id);
    const totalClasses = studentAttendance.length;
    const present = studentAttendance.filter(a => a.status === 'present').length;
    const absent = totalClasses - present;
    const percentage = totalClasses > 0 ? ((present / totalClasses) * 100).toFixed(2) : 0;
    
    let status = 'Good';
    let statusClass = 'status-good';
    
    if (percentage < 75) {
      status = 'Low';
      statusClass = 'status-danger';
    } else if (percentage < 85) {
      status = 'Average';
      statusClass = 'status-warning';
    }
    
    return `
      <tr>
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.department}</td>
        <td>Year ${student.year}</td>
        <td>${totalClasses}</td>
        <td>${present}</td>
        <td>${absent}</td>
        <td>${percentage}%</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
      </tr>
    `;
  }).join('');
}
