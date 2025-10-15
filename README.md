# Eduva Learning Management System

A simple web-based learning management system with teacher dashboard functionality.

## Features

- **Login System**: Simple authentication with role-based access
- **Teacher Dashboard**: Complete dashboard for teachers with:
  - Syllabus management
  - Daily progress tracking
  - Assignment management
  - Student feedback viewing

## How to Test

### 1. Start the Application

1. Open `login.html` in your web browser
2. The login page will load with teacher role selected by default

### 2. Login as Teacher

Use these test credentials:
- **Email**: `teacher@eduva.com`
- **Password**: `password`
- **Role**: Teacher (already selected)

**Note**: After successful login, you'll be redirected to `tec.html` (the teacher dashboard)

### 3. Test Teacher Dashboard Features

#### Daily Entry Form (Fixed Issue)
1. Click on "Daily Tracker" tab
2. Click "Add Today's Entry" button
3. Fill in the form:
   - Date: Select today's date
   - Subject: Choose from dropdown (populated from syllabus)
   - Topics: Enter topics covered (comma-separated)
   - Notes: Add any observations
4. Click "Save Log" - this now works properly!

#### Syllabus Management
1. Click on "Syllabus" tab
2. View subjects (Mathematics and Physics) with topics
3. **Interactive Topic Completion**: Click the circles next to topic names to mark/unmark completion
   - ✅ Completed topics show green checkmarks and strikethrough text
   - ⭕ Pending topics show empty circular buttons
4. **Add Topics**: Click the "+" button on subject cards to open the "Add New Topic" form
5. **Add New Topic Form**: Fill in subject, topic name, description, and duration
6. **Add Subjects**: Use "Add Subject" button to create new subject cards
7. **Delete Topics**: Click the red trash icon next to any topic to delete it
8. **Delete Subjects**: Click the red trash icon in the subject header to delete the entire subject (and all its topics)

#### Other Features
- Assignment management (view existing assignments)
- Student feedback viewing
- Class/semester selection

## File Structure

- `login.html` - Main login page
- `tec.html` - Teacher dashboard (main dashboard for teachers)
- `teacher.html` - Alternative teacher dashboard with advanced features
- `login.js` - Backend server (Node.js/Express) - optional for full functionality
- `WEBSITE/public/index.html` - Alternative login with Firebase integration

## Technical Details

### Fixed Issues
1. **Daily Entry Form**: Added proper event listener for "Save Log" button
2. **Login Integration**: Connected login page to teacher dashboard with proper redirection
3. **Data Persistence**: Added localStorage integration for user session management

### Key Features
- Responsive design with Tailwind CSS
- Role-based authentication
- Real-time form validation
- Dynamic content rendering
- Modern UI with Lucide icons

## Browser Compatibility

Tested on modern browsers (Chrome, Firefox, Safari, Edge). Requires JavaScript enabled.

## Development Notes

- Uses vanilla JavaScript (no frameworks)
- Styling with Tailwind CSS CDN
- Icons from Lucide
- Local storage for session management
- Sample data included for testing

