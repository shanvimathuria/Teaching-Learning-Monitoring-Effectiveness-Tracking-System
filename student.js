// Global State for the Student Dashboard
let studentState = {
    currentView: 'subjects',
    assignmentFilter: 'all',
    activeSubject: 'Mathematics', // Default active subject
    feedbackSubject: null,
    
    // Core Data
    subjects: [
        {
            id: 1, name: "Mathematics", teacher: "Dr. Anjali Sharma", progress: "1/3", completionPercent: 33,
            topics: [
                { id: 1, title: "Calculus - Derivatives", completed: true, date: "1/22/2025" },
                { id: 2, title: "Calculus - Integrals", completed: false, date: "1/25/2025" },
                { id: 3, title: "Linear Algebra", completed: false, date: "1/30/2025" }
            ],
            feedbackCompleted: false
        },
        {
            id: 2, name: "Physics", teacher: "Prof. Rajesh Kumar", progress: "1/2", completionPercent: 50,
            topics: [
                { id: 4, title: "Electromagnetic Waves", completed: true, date: "1/21/2025" },
                { id: 5, title: "Quantum Mechanics", completed: false, date: "2/05/2025" }
            ],
            feedbackCompleted: false
        }
    ],

    // Assignments Data (Update 2: Upcoming Deadlines = 1)
    assignments: [
        {
            id: 101, title: "Calculus Problem Set 1", type: "ASSIGNMENT", subject: "Mathematics",
            description: "Solve problems related to derivatives and their applications.",
            marks: 50, due: "2025-01-25", status: "pending", submittedOn: null, gradedMarks: null // This is the single upcoming deadline
        },
    ],
    
    // Activities Data (Update 3: Initial mock achievements)
    activities: [
        {
            id: 201, title: "National Science Olympiad", category: "Competition", organizer: "National Science Foundation",
            date: "2025-01-15", score: "3rd Position", description: "Secured 3rd position in the state level competition.",
            isAchievement: true, file: 'science_olympiad_certificate.pdf'
        },
        {
            id: 202, title: "Mathematics Club Workshop", category: "Workshop", organizer: "School Math Club",
            date: "2025-01-10", score: null, description: "Attended a workshop on advanced problem-solving techniques.",
            isAchievement: false, file: null
        }
    ]
};

// -------------------------
// RENDER FUNCTIONS
// -------------------------

function renderView() {
    // Logic to switch visibility of main content tabs and update nav styling
    document.querySelectorAll('.content-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(studentState.currentView + '-view').classList.remove('hidden');
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === studentState.currentView);
    });

    if (studentState.currentView === 'subjects') renderSubjectCards();
    if (studentState.currentView === 'assignments') renderAssignments();
    if (studentState.currentView === 'activities') renderActivities();
    if (studentState.currentView === 'feedback') renderFeedbackSubjects();

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

// Renders subject cards and detailed progress on click
function renderSubjectCards() {
    const container = document.getElementById('my-subjects');
    container.innerHTML = '';
    studentState.subjects.filter(s => s.completionPercent > 0).forEach(subject => {
        const card = document.createElement('div');
        card.className = `p-6 rounded-xl shadow-md transition duration-200 cursor-pointer flex items-center space-x-4 ${studentState.activeSubject === subject.name ? 'bg-blue-50 border-2 border-blue-400 ring-2 ring-blue-100' : 'bg-white border border-gray-100 hover:shadow-lg'}`;
        card.onclick = () => { studentState.activeSubject = subject.name; renderView(); };
        card.innerHTML = `
            <i data-lucide="book-open" class="w-8 h-8 text-blue-600 flex-shrink-0"></i>
            <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-800">${subject.name}</h3>
                <p class="text-sm text-gray-500">Dr. Anjali Sharma</p>
                <div class="mt-2 flex items-center">
                    <div class="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                        <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${subject.completionPercent}%"></div>
                    </div>
                    <span class="text-xs font-medium text-gray-600">${subject.progress}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    renderSubjectDetail(); // Render the detail section for the active subject
}

function renderSubjectDetail() {
    const detailContainer = document.getElementById('subject-detail-section');
    const subjectData = studentState.subjects.find(s => s.name === studentState.activeSubject);

    if (!subjectData) { detailContainer.classList.add('hidden'); return; }

    detailContainer.classList.remove('hidden');
    
    // Adjusted to reflect the mock progress image (image_30185d.png)
    const topicsHtml = subjectData.topics.map(topic => {
        const icon = topic.completed ? 'check-circle' : 'clock';
        const iconClass = topic.completed ? 'text-green-500' : 'text-gray-500';
        const titleClass = topic.completed ? 'text-green-600' : 'text-gray-800';
        
        // Mock file download link only for the completed topic
        const fileLink = topic.completed ? `<div class="mt-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center">
            <i data-lucide="download" class="w-4 h-4 mr-1"></i> derivatives_notes.pdf
        </div>` : '';

        // Mock class notes only for the completed topic
        const classNotes = topic.completed ? `<div class="bg-white p-3 rounded-lg mt-3 border border-gray-200">
            <h5 class="text-sm font-semibold mb-1">Class Notes</h5>
            <p class="text-xs text-gray-600">Key concepts covered: derivative definition, power rule, chain rule</p>
            ${fileLink}
        </div>` : '';

        return `
            <div class="flex items-start space-x-4 p-4 border-b last:border-b-0">
                <i data-lucide="${icon}" class="w-5 h-5 ${iconClass} mt-1 flex-shrink-0"></i>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <h4 class="font-semibold ${titleClass}">${topic.title}</h4>
                        <span class="text-sm text-gray-500">${topic.completed ? 'Completed' : 'Scheduled'} ${topic.date}</span>
                    </div>
                    <p class="text-sm text-gray-600">${topic.completed ? 'Introduction to derivatives and their applications' : (topic.title.includes('Integral') ? 'Integration techniques and applications' : 'Matrices, vectors, and linear transformations')}</p>
                    ${classNotes}
                </div>
            </div>
        `;
    }).join('');

    detailContainer.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <div class="flex items-center space-x-3">
                <i data-lucide="book" class="w-7 h-7 text-blue-600"></i>
                <h3 class="text-2xl font-bold">${subjectData.name}</h3>
            </div>
            <div class="text-right">
                <p class="text-3xl font-bold text-blue-600">${subjectData.completionPercent}%</p>
                <p class="text-sm font-medium text-gray-500">Complete</p>
            </div>
        </div>
        <p class="text-md text-gray-600 mb-6">Taught by ${subjectData.teacher}</p>
        
        <h4 class="text-xl font-bold text-gray-800 mb-4">Topics Covered</h4>
        <div class="border rounded-xl bg-white divide-y">
            ${topicsHtml}
        </div>
    `;
}

// Renders assignments based on filter
function renderAssignments() {
    const container = document.getElementById('assignment-list');
    container.innerHTML = '';
    
    // Logic to update sub-nav styling (All, Pending, Submitted, Graded)
    document.querySelectorAll('.sub-nav-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.assignmentFilter === studentState.assignmentFilter);
    });
    
    const filteredAssignments = studentState.assignments.filter(a => {
        if (studentState.assignmentFilter === 'all') return true;
        return a.status === studentState.assignmentFilter;
    });

    if (filteredAssignments.length === 0) {
        let message = '';
        if (studentState.assignmentFilter === 'submitted') message = 'No assignments submitted yet. Get started on your pending tasks!';
        else if (studentState.assignmentFilter === 'graded') message = 'No graded assignments yet. Your teacher is still reviewing submissions.';
        else if (studentState.assignmentFilter === 'pending') message = 'No pending assignments! Great job, all caught up!';
        else message = 'No assignments available for this class.';

        container.innerHTML = `<div class="col-span-2 text-center py-12 bg-gray-50 rounded-xl"><p class="text-gray-500 text-lg">${message}</p></div>`;
        return;
    }
    
    filteredAssignments.forEach(a => {
        const isOverdue = new Date(a.due) < new Date() && a.status === 'pending';
        const statusTag = a.status === 'pending' 
            ? `<span class="text-sm font-semibold bg-orange-100 text-orange-700 px-3 py-1 rounded-full flex items-center"><i data-lucide="clock" class="w-4 h-4 mr-1"></i> Pending</span>`
            : a.status === 'submitted'
            ? `<span class="text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center"><i data-lucide="upload-cloud" class="w-4 h-4 mr-1"></i> Submitted</span>`
            : `<span class="text-sm font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center"><i data-lucide="check-circle" class="w-4 h-4 mr-1"></i> Graded</span>`;

        const submissionDetails = a.status === 'submitted' 
            ? `<div class="mt-3 text-sm text-green-600 flex items-center"><i data-lucide="check-circle" class="w-4 h-4 mr-1"></i> Submitted - Awaiting Grade</div>`
            : isOverdue 
            ? `<div class="text-red-500 font-medium mt-1">Overdue</div><p class="text-xs text-red-500 mt-1 flex items-center"><i data-lucide="alert-circle" class="w-3 h-3 mr-1"></i> This assignment is overdue. Contact your teacher if needed.</p>`
            : '';

        const actionButton = a.status === 'pending'
            ? `<button class="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 mt-4">Submit</button>`
            : a.status === 'graded'
            ? `<div class="text-lg font-bold text-green-600 mt-4">Score: ${a.gradedMarks}/${a.marks}</div>`
            : '';
            
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-xl shadow-lg border border-gray-200';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center space-x-2">
                    <i data-lucide="file-text" class="w-6 h-6 text-gray-500"></i>
                    <h4 class="text-lg font-semibold text-gray-800">${a.title}</h4>
                </div>
                ${statusTag}
            </div>
            
            <p class="text-sm font-medium text-gray-600">${a.subject}</p>
            <span class="text-xs font-semibold ${a.type === 'ASSIGNMENT' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'} px-2.5 py-0.5 rounded-full">${a.type}</span>
            <p class="text-sm text-gray-700 mt-3">${a.description}</p>
            
            <div class="mt-4">
                <p class="text-sm text-gray-600 flex items-center"><i data-lucide="calendar" class="w-4 h-4 mr-1"></i> Due: ${new Date(a.due).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</p>
                <p class="text-sm font-medium text-gray-700 mt-1">Total Marks: ${a.marks}</p>
                ${submissionDetails}
            </div>
            
            ${actionButton}
        `;
        container.appendChild(card);
    });
}

// Renders activities and updates summary counts (Update 3)
function renderActivities() {
    const container = document.getElementById('activities-list');
    container.innerHTML = '';
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalActivities = studentState.activities.length;
    const achievementsCount = studentState.activities.filter(a => a.isAchievement || a.score).length;
    const thisMonthCount = studentState.activities.filter(a => {
        const activityDate = new Date(a.date);
        return activityDate.getMonth() === currentMonth && activityDate.getFullYear() === currentYear;
    }).length;

    // Update Top Summary Cards (Update 3)
    document.getElementById('activities-count').textContent = totalActivities;
    // Update Activities View Summary Cards (Update 1)
    document.getElementById('total-activities-count').textContent = totalActivities;
    document.getElementById('achievements-count').textContent = achievementsCount;
    document.getElementById('this-month-count').textContent = thisMonthCount;

    if (totalActivities === 0) {
        container.innerHTML = '<div class="text-center py-12 bg-gray-50 rounded-xl"><p class="text-gray-500 text-lg">No activities or achievements logged yet. Click "Add Activity" to record one!</p></div>';
        return;
    }

    // Sort by date descending
    const sortedActivities = [...studentState.activities].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedActivities.forEach(a => {
        const isAchievement = a.isAchievement || a.score;
        const icon = isAchievement ? 'trophy' : a.category === 'Workshop' ? 'users' : 'clipboard';
        const iconColor = isAchievement ? 'text-purple-600' : a.category === 'Workshop' ? 'text-blue-600' : 'text-gray-600';
        const achievementTag = isAchievement ? `<span class="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full ml-2">${a.score}</span>` : '';
        const categoryTag = `<span class="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">${a.category}</span>`;
        const dateStr = new Date(a.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
        
        const fileUpload = a.file 
            ? `<a href="#" class="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-2"><i data-lucide="upload" class="w-4 h-4 mr-1"></i> ${a.file}</a>` 
            : `<button class="text-sm text-gray-500 hover:text-blue-600 flex items-center mt-2"><i data-lucide="upload-cloud" class="w-4 h-4 mr-1"></i> Upload Certificate</button>`;


        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-xl shadow-md border border-gray-100 relative';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center space-x-3">
                    <i data-lucide="${icon}" class="w-6 h-6 ${iconColor} flex-shrink-0"></i>
                    <div>
                        <h4 class="text-lg font-semibold text-gray-800">${a.title}</h4>
                        <p class="text-sm text-gray-500">${a.organizer}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-500">${dateStr}</span>
                    <button class="text-red-500 hover:text-red-700" onclick="deleteActivity(${a.id})" title="Delete Activity">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
            
            <div class="flex items-center space-x-3 mb-3">
                ${categoryTag}
                ${achievementTag}
            </div>
            
            <p class="text-sm text-gray-700 mb-3">${a.description}</p>
            
            ${fileUpload}
        `;
        container.appendChild(card);
    });
}

// Renders feedback subject buttons (Update 4: Removed "Submit" word)
function renderFeedbackSubjects() {
    const container = document.getElementById('feedback-subjects');
    container.innerHTML = '';
    
    const completedCount = studentState.subjects.filter(s => s.feedbackCompleted).length;
    const totalSubjects = studentState.subjects.length;
    const progressPercent = totalSubjects > 0 ? Math.round((completedCount / totalSubjects) * 100) : 0;

    studentState.subjects.forEach(subject => {
        const button = document.createElement('button');
        button.className = `flex items-center text-sm font-medium py-2 px-4 rounded-full transition duration-150 shadow-sm ${subject.feedbackCompleted 
            ? 'bg-green-100 text-green-800 border-2 border-green-300' 
            : 'bg-white text-blue-600 border-2 border-blue-400 hover:bg-blue-50'}`;
        
        // Removed 'Submit' from button text (Update 4)
        button.innerHTML = `
            <i data-lucide="${subject.feedbackCompleted ? 'check-circle' : 'message-square'}" class="w-4 h-4 mr-2"></i> 
            ${subject.name}
            ${subject.feedbackCompleted ? ' (Completed)' : ''}
        `;
        button.disabled = subject.feedbackCompleted;
        if (!subject.feedbackCompleted) {
            button.onclick = () => showFeedbackModal(subject.name); // Calls modal on click
        }
        container.appendChild(button);
    });

    // Update progress elements
    document.getElementById('feedback-completion-text').textContent = `${completedCount} of ${totalSubjects} subjects completed`;
    document.getElementById('feedback-progress-bar').style.width = `${progressPercent}%`;
}

// -------------------------
// MODAL & ACTION HANDLERS
// -------------------------

function showFeedbackModal(subjectName) {
    studentState.feedbackSubject = subjectName;
    document.getElementById('feedback-subject-title').textContent = subjectName;
    document.getElementById('feedback-modal').classList.remove('hidden');
    // Reset form
    document.getElementById('feedback-form').reset();
}
function hideFeedbackModal() {
    document.getElementById('feedback-modal').classList.add('hidden');
}

document.getElementById('feedback-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const rating = document.querySelector('input[name="rating"]:checked');
    const comments = document.getElementById('feedback-comments').value.trim();
    
    if (!rating) {
        showAlert('Error', 'Please select a rating before submitting.');
        return;
    }

    const subject = studentState.subjects.find(s => s.name === studentState.feedbackSubject);
    if (subject) {
        subject.feedbackCompleted = true; // Marks as complete
        // In a real app, you would send this data to a server
        console.log(`Feedback submitted for ${subject.name}: Rating=${rating.value}, Comments=${comments}`);
    }
    hideFeedbackModal();
    showAlert('Success!', `Thank you for your feedback for ${studentState.feedbackSubject}.`);
    studentState.feedbackSubject = null;
    renderFeedbackSubjects(); // Re-render to show updated progress
});

function showAddActivityModal() {
    document.getElementById('add-activity-modal').classList.remove('hidden');
    document.getElementById('add-activity-form').reset(); // Reset form on open
}
function hideAddActivityModal() {
    document.getElementById('add-activity-modal').classList.add('hidden');
}

document.getElementById('add-activity-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('activity-title').value.trim();
    const category = document.getElementById('activity-category').value;
    const date = document.getElementById('activity-date').value;
    const organizer = document.getElementById('activity-organizer').value.trim();
    const score = document.getElementById('activity-score').value.trim() || null;
    const description = document.getElementById('activity-description').value.trim();
    
    if (!title || !date || !organizer || !description) return;

    const newActivity = {
        id: Date.now(), title, category, organizer, date, score, description,
        isAchievement: !!score, // Set as achievement if score is present
        file: null
    };
    studentState.activities.unshift(newActivity); // Adds new activity
    
    hideAddActivityModal();
    showAlert('Success!', `Activity "${title}" has been logged successfully!`);
    renderActivities(); // Update counts and list immediately
});

function deleteActivity(id) {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    studentState.activities = studentState.activities.filter(a => a.id !== id);
    renderActivities();
}

// Custom Alert Implementation
function showAlert(title, message) {
  document.getElementById('alert-title').textContent = title;
  document.getElementById('alert-message').textContent = message;
  document.getElementById('custom-alert-modal').classList.remove('hidden');
}
document.getElementById('close-alert-button').addEventListener('click', () => {
  document.getElementById('custom-alert-modal').classList.add('hidden');
});
document.getElementById('custom-alert-modal').addEventListener('click', (e) => {
  if (e.target.id === 'custom-alert-modal') document.getElementById('custom-alert-modal').classList.add('hidden');
});


// -------------------------
// INITIALIZATION
// -------------------------

function handleAssignmentFilter(filter) {
    studentState.assignmentFilter = filter;
    renderAssignments();
}

// Authentication check function
function checkAuthentication() {
    const userToken = localStorage.getItem('userToken');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    // Check if user is authenticated and is a student
    if (!userToken || userRole !== 'student') {
        // Clear any invalid data and redirect to login
        localStorage.clear();
        window.location.href = 'login.html';
        return false;
    }
    
    // Update the student name in the header
    const studentNameElement = document.getElementById('student-name');
    if (studentNameElement && userName) {
        studentNameElement.textContent = userName;
    }
    
    return true;
}

// Logout function
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

function initApp() {
    // Check authentication first
    if (!checkAuthentication()) {
        return; // Stop initialization if not authenticated
    }
    
    // Expose functions to global scope for inline HTML handlers
    window.hideFeedbackModal = hideFeedbackModal;
    window.hideAddActivityModal = hideAddActivityModal;
    window.deleteActivity = deleteActivity;
    window.handleLogout = handleLogout;
    
    // Attach event listeners for main tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            studentState.currentView = tab.dataset.view;
            renderView();
        });
    });
    
    // Attach event listeners for assignment sub-tabs
    document.querySelectorAll('[data-assignment-filter]').forEach(tab => {
        tab.addEventListener('click', (e) => {
            handleAssignmentFilter(e.target.dataset.assignmentFilter);
        });
    });

    document.getElementById('add-activity-button').addEventListener('click', showAddActivityModal);
    
    // Add logout button event listener
    const logoutButton = document.getElementById('exit-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    // Initial render
    renderView();
}

window.onload = initApp;