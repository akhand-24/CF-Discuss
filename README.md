# CF-Discuss: Codeforces Discussion App

CF-Discuss is a StackOverflow/Quora-style discussion forum tailored for Codeforces users. It allows users to register using their Codeforces handle, post questions linked to specific Codeforces contests, paste programming code that is rendered inside high-visibility dark code blocks, and vote on questions/answers so the most helpful responses float to the top.

---

## Tech Stack

- **Frontend**: React (Vite), React Router, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, JWT Authentication, Axios (proxying Codeforces API)
- **Database**: MongoDB (Mongoose) with an automatic local JSON-file fallback database if MongoDB is not running locally.

---

## Key Features

1. **User Authentication**: Simple signup and signin requiring a username, Codeforces handle, and password. JWT tokens are stored in the client session for request authorization.
2. **Upvote/Downvote Engine**: Users can upvote or downvote questions and answers. The home page automatically sorts discussions by net score (upvotes minus downvotes) descending, ensuring top-quality queries bubble to the top.
3. **Dedicated Code Blocks**: Code snippets are displayed in high-contrast dark blocks completely separated from the text descriptions. Includes copy-to-clipboard functionality with dynamic button status.
4. **Codeforces Contests Integration**: Fetches list of finished and active contests directly from the Codeforces API with backend in-memory caching to avoid rate limiting.
5. **Contest-Specific Discussions**: Users can filter discussion feeds by a selected contest or link newly posted questions to a particular contest.
6. **Nested Comment Threads**: Direct, lightweight commenting interface on both questions and answers to allow secondary discussions without cluttering the main solutions list.
7. **Robust Database Fallback**: Out-of-the-box development setup. If a local MongoDB instance is not detected, the backend dynamically falls back to file-based JSON storage inside the project.

---

## Application Workflow

### 1. Registration & Authentication
- A user signs up on the Register page. They enter a username, their public Codeforces handle, and a password.
- Upon successful registration, the backend hashes the password, creates the user profile, signs a JWT token, and returns the session.
- The token is saved in localStorage and parsed by the AuthContext provider to maintain persistent session state across page refreshes.

### 2. Browsing & Filtering discussions
- The main Feed page displays questions posted by users.
- Questions are fetched from `/api/questions` and sorted by score (net votes) by default. The user can switch the sorting to "Newest Posts" or search questions using text matches on title or body.
- When filtering by a contest, only questions linked to that contest are fetched.

### 3. Creating a Discussion
- An authenticated user clicks "Ask Question" or navigates to `/ask`.
- They fill in a title, optional contest link, text description, optional code snippet, and code language.
- Submission sends a POST request to `/api/questions`, and the user is redirected to the detail page.

### 4. Detail View & Q&A
- The question is displayed with its vote count, description, and copyable dark code block.
- Users can upvote/downvote, toggle comments, and read comments left by other users.
- Below the question, other users can submit solutions. Each solution contains text explanation, optional code block, upvote buttons, and its own comment threads.

### 5. Contests Directory
- Navigating to "Contests" fetches the list of contests from the Codeforces public API.
- Users can search contests by name or filter by phase (All, Finished, Upcoming/Live).
- Next to each contest, buttons link to "View discussions" (filtering the main feed to that contest) or "Ask Question" (pre-selecting that contest link).

---

## Running the Project

### Prerequisites
- Node.js (v18 or higher)
- Optional: MongoDB installed and running locally on port 27017

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env` (optional, defaults are pre-configured):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/cf_discuss
   JWT_SECRET=supersecret_codeforces_token_key_123
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *Note: If MongoDB is not running, the console will show a message indicating it has fallen back to JSON file storage.*

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.
