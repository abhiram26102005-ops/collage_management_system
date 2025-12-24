/**
 * Authentication Module
 * Handles user login, role-based authentication, and session management
 */

import { getUsers, setCurrentUser } from './api.js';

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});

/**
 * Initialize authentication system
 */
function initAuth() {
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Check if user is already logged in
  checkAuth();
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
  e.preventDefault();
  
  const role = document.getElementById('role').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Clear previous error messages
  hideError();
  
  // Validate inputs
  if (!role || !username || !password) {
    showError('Please fill in all fields');
    return;
  }
  
  // Get users from mock database
  const users = getUsers();
  
  // Find user with matching credentials
  const user = users.find(u => 
    u.username === username && 
    u.password === password && 
    u.role === role
  );
  
  if (user) {
    // Store user session
    setCurrentUser(user);
    
    // Redirect to appropriate dashboard
    redirectToDashboard(user.role);
  } else {
    showError('Invalid credentials. Please check your username, password, and role.');
  }
}

/**
 * Check if user is authenticated
 */
function checkAuth() {
  const currentUser = getCurrentUser();
  
  // If on login page and user is logged in, redirect to dashboard
  if (currentUser && window.location.pathname === '/index.html') {
    redirectToDashboard(currentUser.role);
  }
  
  // If not on login page and user is not logged in, redirect to login
  if (!currentUser && window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
    window.location.href = '/index.html';
  }
}

/**
 * Get current logged-in user
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Redirect to appropriate dashboard based on role
 */
function redirectToDashboard(role) {
  switch(role) {
    case 'admin':
      window.location.href = '/admin/admin-dashboard.html';
      break;
    case 'faculty':
      window.location.href = '/faculty/faculty-dashboard.html';
      break;
    case 'student':
      window.location.href = '/student/student-dashboard.html';
      break;
    default:
      showError('Invalid role');
  }
}

/**
 * Logout user
 */
export function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = '/index.html';
}

/**
 * Show error message
 */
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

/**
 * Hide error message
 */
function hideError() {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

/**
 * Check if user has required role
 */
export function hasRole(requiredRole) {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.role === requiredRole;
}

/**
 * Protect page based on role
 */
export function protectPage(requiredRole) {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    window.location.href = '/index.html';
    return false;
  }
  
  if (currentUser.role !== requiredRole) {
    alert('Access denied. You do not have permission to view this page.');
    redirectToDashboard(currentUser.role);
    return false;
  }
  
  return true;
}
