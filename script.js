
let feedbacks = [];
const STORAGE_KEY = "insightflow_feedback";
let currentView = "home";

// ========== UTILITY FUNCTIONS ==========

/**
 * Load feedback data from localStorage
 */
function loadFeedbacksFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      feedbacks = JSON.parse(stored);
    } catch (e) {
      feedbacks = [];
    }
  } else {
    // Seed demo data for better UX
    feedbacks = [
      {
        id: "demo1",
        name: "Olivia Chen",
        email: "olivia@example.com",
        category: "bug",
        rating: 4,
        message:
          "The interface is incredibly smooth, but dark mode would be a nice addition!",
        date: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "demo2",
        name: "Marcus Wright",
        email: "marcus@example.com",
        category: "feature",
        rating: 5,
        message:
          "I love the real-time feedback concept. Keep up the great work!",
        date: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "demo3",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        category: "ux",
        rating: 5,
        message: "Very intuitive design! The rating system is easy to use.",
        date: new Date(Date.now() - 259200000).toISOString(),
      },
    ];
    saveToLocalStorage();
  }
}

/**
 * Save feedback data to localStorage
 */
function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks));
}

/**
 * Add new feedback item
 */
function addFeedbackItem(feedbackObj) {
  feedbacks.unshift(feedbackObj);
  saveToLocalStorage();
  showToast("Feedback submitted successfully! ✨");
  renderCurrentView();
}

/**
 * Delete feedback by ID
 */
function deleteFeedbackById(id) {
  feedbacks = feedbacks.filter((fb) => fb.id !== id);
  saveToLocalStorage();
  showToast("Feedback removed successfully");
  renderCurrentView();
}

/**
 * Show toast notification
 */
function showToast(message, isError = false) {
  const toast = document.getElementById("toastMsg");
  toast.textContent = message;
  toast.style.backgroundColor = isError ? "#b91c1c" : "#0f3b5c";
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    toast.style.backgroundColor = "#0f3b5c";
  }, 2800);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Get category icon emoji
 */
function getCategoryIcon(cat) {
  const icons = {
    bug: "🐞",
    feature: "✨",
    ux: "🎨",
    general: "💬",
  };
  return icons[cat] || "📝";
}

/**
 * Format date for display
 */
function formatDate(isoString) {
  if (!isoString) return "Just now";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "recent";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Update rating selection UI
 */
function updateRatingSelectionUI() {
  const selectedRadio = document.querySelector('input[name="rating"]:checked');
  const allRatingOptions = document.querySelectorAll(".rating-option");
  if (allRatingOptions.length) {
    allRatingOptions.forEach((opt) => opt.classList.remove("selected"));
    if (selectedRadio) {
      const parentDiv = selectedRadio.closest(".rating-option");
      if (parentDiv) parentDiv.classList.add("selected");
    }
  }
}

/**
 * Render Home View with form and recent feedback
 */
function renderHomeView() {
  return `
        <div class="form-card" id="feedbackFormCard">
            <h2><i class="fas fa-pen-alt"></i> Share Your Experience</h2>
            <form id="feedbackForm">
                <div class="form-group">
                    <label><i class="fas fa-user"></i> Full Name *</label>
                    <input type="text" id="nameInput" placeholder="John Doe" autocomplete="name" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-envelope"></i> Email Address *</label>
                    <input type="email" id="emailInput" placeholder="hello@example.com" autocomplete="email" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-tag"></i> Feedback Category</label>
                    <select id="categorySelect">
                        <option value="general">💬 General Feedback</option>
                        <option value="bug">🐞 Bug Report</option>
                        <option value="feature">✨ Feature Request</option>
                        <option value="ux">🎨 UX Improvement</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-star"></i> Rating (1-5)</label>
                    <div class="rating-group" id="ratingGroup">
                        ${[1, 2, 3, 4, 5]
                          .map(
                            (star) => `
                            <div class="rating-option ${star === 3 ? "selected" : ""}">
                                <input type="radio" name="rating" value="${star}" id="star${star}" ${star === 3 ? "checked" : ""}>
                                <label for="star${star}">${star} ★</label>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-comment"></i> Your Message *</label>
                    <textarea rows="4" id="messageInput" placeholder="Tell us what you think..." required></textarea>
                </div>
                <button type="submit" class="btn-submit">
                    <i class="fas fa-paper-plane"></i> Submit Feedback
                </button>
            </form>
        </div>
        <div class="feedback-list-card">
            <h2><i class="fas fa-chart-line"></i> Recent Feedback</h2>
            <div id="recentFeedbackPreview">
                ${renderFeedbackPreview()}
            </div>
        </div>
    `;
}

/**
 * Render preview of recent feedback (max 3 items)
 */
function renderFeedbackPreview() {
  if (!feedbacks.length) {
    return `<div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No feedback yet. Be the first to share your thoughts!</p>
        </div>`;
  }

  const latest = feedbacks.slice(0, 3);
  return `<div class="feedback-grid">
        ${latest
          .map(
            (fb) => `
            <div class="feedback-item">
                <div class="feedback-header">
                    <span class="feedback-name">
                        <i class="fas fa-user-circle"></i> ${escapeHtml(fb.name)}
                    </span>
                    <span class="feedback-rating">
                        <i class="fas fa-star" style="color:#f5b042;"></i> ${fb.rating}/5
                    </span>
                </div>
                <div class="feedback-category">
                    ${getCategoryIcon(fb.category)} ${fb.category.toUpperCase()}
                </div>
                <div class="feedback-message">
                    ${escapeHtml(fb.message.length > 120 ? fb.message.substring(0, 120) + "..." : fb.message)}
                </div>
                <div class="feedback-footer">
                    <span><i class="far fa-calendar-alt"></i> ${formatDate(fb.date)}</span>
                    <button class="delete-btn" data-id="${fb.id}">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            </div>
        `,
          )
          .join("")}
        ${
          feedbacks.length > 3
            ? `
            <div style="text-align: center; margin-top: 0.8rem;">
                <a href="#" id="viewAllLink" style="color: #2c7da0; font-weight: 500; text-decoration: none;">
                    <i class="fas fa-arrow-right"></i> View all ${feedbacks.length} feedbacks
                </a>
            </div>
        `
            : ""
        }
    </div>`;
}

/**
 * Render All Feedback View
 */
function renderAllFeedbackView() {
  if (!feedbacks.length) {
    return `<div class="feedback-list-card">
            <h2><i class="fas fa-list"></i> All Feedback</h2>
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No feedback entries yet. Submit your first feedback!</p>
            </div>
        </div>`;
  }

  return `
        <div class="feedback-list-card">
            <h2><i class="fas fa-list-ul"></i> All Feedback (${feedbacks.length})</h2>
            <div class="feedback-grid" id="allFeedbackGrid">
                ${feedbacks
                  .map(
                    (fb) => `
                    <div class="feedback-item" data-feedback-id="${fb.id}">
                        <div class="feedback-header">
                            <span class="feedback-name">
                                <i class="fas fa-user-astronaut"></i> ${escapeHtml(fb.name)}
                                <span style="font-size: 0.8rem; color: #5f7d9c;">(${escapeHtml(fb.email)})</span>
                            </span>
                            <span class="feedback-rating">
                                <i class="fas fa-star" style="color:#f5b042;"></i> ${fb.rating}/5
                            </span>
                        </div>
                        <div class="feedback-category">
                            ${getCategoryIcon(fb.category)} ${fb.category.charAt(0).toUpperCase() + fb.category.slice(1)}
                        </div>
                        <div class="feedback-message">
                            ${escapeHtml(fb.message)}
                        </div>
                        <div class="feedback-footer">
                            <span><i class="far fa-clock"></i> ${formatDate(fb.date)}</span>
                            <button class="delete-btn" data-id="${fb.id}">
                                <i class="fas fa-trash-alt"></i> Remove
                            </button>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `;
}

/**
 * Render About View
 */
function renderAboutView() {
  return `
        <div class="form-card" style="text-align: center;">
            <h2><i class="fas fa-info-circle"></i> About InsightFlow</h2>
            <div style="line-height: 1.8; font-size: 1rem; margin: 2rem 0;">
                <p><i class="fas fa-check-circle" style="color: #2c7da0;"></i> A modern, production-ready feedback system</p>
                <p><i class="fas fa-database"></i> All feedback stored securely in your browser's LocalStorage</p>
                <p><i class="fas fa-mobile-alt"></i> Fully responsive & accessible design</p>
                <p><i class="fas fa-code"></i> Built with vanilla HTML, CSS, and JavaScript</p>
                <p><i class="fas fa-shield-alt"></i> No server required - your data stays private</p>
                <hr style="margin: 2rem 0; opacity: 0.3;">
                <p style="font-size: 1.1rem;">⭐ Your insights help us grow. Every rating and comment matters.</p>
                <p style="margin-top: 1rem; color: #2c7da0;">
                    <i class="fas fa-heart"></i> Thank you for being part of our community!
                </p>
            </div>
            <button class="btn-submit" id="gotoHomeAboutBtn" style="background: #2c7da0;">
                <i class="fas fa-comment"></i> Give Feedback Now
            </button>
        </div>
    `;
}

/**
 * Render current view based on navigation state
 */
function renderCurrentView() {
  const appRoot = document.getElementById("app-root");
  if (!appRoot) return;

  let html = "";
  if (currentView === "home") {
    html = renderHomeView();
  } else if (currentView === "list") {
    html = renderAllFeedbackView();
  } else if (currentView === "about") {
    html = renderAboutView();
  } else {
    html = renderHomeView();
  }

  appRoot.innerHTML = html;

  // Re-attach rating UI highlight if on home view
  if (currentView === "home") {
    updateRatingSelectionUI();
  }
}

/**
 * Update active navigation link
 */
function updateActiveNav() {
  const navHome = document.getElementById("nav-home");
  const navList = document.getElementById("nav-feedback");
  const navAbout = document.getElementById("nav-about");

  if (navHome && navList && navAbout) {
    navHome.classList.remove("active");
    navList.classList.remove("active");
    navAbout.classList.remove("active");

    if (currentView === "home") navHome.classList.add("active");
    else if (currentView === "list") navList.classList.add("active");
    else if (currentView === "about") navAbout.classList.add("active");
  }
}

/**
 * Handle feedback form submission
 */
function handleFeedbackSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("nameInput").value.trim();
  const email = document.getElementById("emailInput").value.trim();
  const category = document.getElementById("categorySelect").value;
  const ratingRadio = document.querySelector('input[name="rating"]:checked');
  const rating = ratingRadio ? parseInt(ratingRadio.value) : 3;
  const message = document.getElementById("messageInput").value.trim();

  // Validation
  if (!name) {
    showToast("Please enter your name", true);
    return;
  }
  if (!email) {
    showToast("Email is required", true);
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    showToast("Please enter a valid email address", true);
    return;
  }
  if (!message) {
    showToast("Please share your feedback message", true);
    return;
  }

  const newFeedback = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
    name: name,
    email: email,
    category: category,
    rating: rating,
    message: message,
    date: new Date().toISOString(),
  };

  addFeedbackItem(newFeedback);

  // Reset form
  const form = document.getElementById("feedbackForm");
  if (form) form.reset();
  const defaultRadio = document.querySelector(
    'input[name="rating"][value="3"]',
  );
  if (defaultRadio) defaultRadio.checked = true;
  updateRatingSelectionUI();
}

/**
 * Setup navigation listeners
 */
function setupNavListeners() {
  const homeLink = document.getElementById("nav-home");
  const listLink = document.getElementById("nav-feedback");
  const aboutLink = document.getElementById("nav-about");

  if (homeLink) {
    homeLink.addEventListener("click", (e) => {
      e.preventDefault();
      currentView = "home";
      renderCurrentView();
      updateActiveNav();
    });
  }

  if (listLink) {
    listLink.addEventListener("click", (e) => {
      e.preventDefault();
      currentView = "list";
      renderCurrentView();
      updateActiveNav();
    });
  }

  if (aboutLink) {
    aboutLink.addEventListener("click", (e) => {
      e.preventDefault();
      currentView = "about";
      renderCurrentView();
      updateActiveNav();
    });
  }
}

/**
 * Setup global event delegation for dynamic elements
 */
function setupGlobalEventDelegation() {
  const root = document.getElementById("app-root");
  if (!root) return;

  // Handle delete buttons and view all links
  root.addEventListener("click", (e) => {
    // Delete button
    const delBtn = e.target.closest(".delete-btn");
    if (delBtn && delBtn.dataset.id) {
      e.preventDefault();
      deleteFeedbackById(delBtn.dataset.id);
      return;
    }

    // View all link from preview
    if (e.target.closest("#viewAllLink")) {
      e.preventDefault();
      currentView = "list";
      renderCurrentView();
      updateActiveNav();
      return;
    }

    // Go to home from about page
    if (e.target.closest("#gotoHomeAboutBtn")) {
      e.preventDefault();
      currentView = "home";
      renderCurrentView();
      updateActiveNav();
      return;
    }
  });

  // Handle form submission
  root.addEventListener("submit", (e) => {
    if (e.target && e.target.id === "feedbackForm") {
      handleFeedbackSubmit(e);
    }
  });

  // Handle rating change for UI update
  root.addEventListener("change", (e) => {
    if (e.target && e.target.getAttribute("name") === "rating") {
      updateRatingSelectionUI();
    }
  });
}

/**
 * Initialize the application
 */
function init() {
  loadFeedbacksFromStorage();
  renderCurrentView();
  setupNavListeners();
  setupGlobalEventDelegation();
  updateActiveNav();
}

// Start the application when DOM is ready
document.addEventListener("DOMContentLoaded", init);
