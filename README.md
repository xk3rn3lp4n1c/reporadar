# Reporadar

**Reporadar** is a powerful tool for tracking and analyzing GitHub repositories. It provides detailed insights into repository activity, including issues, pull requests, releases, and more. With Reporadar, you can easily explore repository details, view READMEs, and interact with an AI-powered chatbot for additional insights.

---

## Features

- **Repository Overview**: View key details like stars, forks, watchers, and license information.
- **Languages Used**: See the breakdown of languages used in the repository.
- **Open Issues**: Explore open issues with labels, reactions, and timestamps.
- **Pull Requests**: Track open pull requests and their details.
- **Releases**: View the latest releases of the repository.
- **AI Chatbot**: Ask questions about the repository and get AI-generated responses.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- GitHub API token (for accessing private repositories)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/reporadar.git
   cd reporadar
  ```
2. Install dependencies:
  ```bash
   npm install
   # or
   yarn install
  ```
3. Set up environment variables:
  - Create a .env file in the root directory.
  - Add your GitHub API token and Google Gemini API key:
  ```bash
   VITE_GITHUB_TOKEN=your_github_token_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
  ```
4. Start the development server:
  ```bash
   npm run dev
   # or
   yarn dev
  ```
5. Open your browser and navigate to http://localhost:5173.

## Usage

### Search for a Repository

1. Enter the GitHub repository URL in the search bar (e.g., `https://github.com/ollama/ollama`).
2. Click "Search" or press Enter.

### Explore Repository Details

- View the repository's overview, languages, open issues, pull requests, and releases.
- Click on any issue or pull request to see more details.

### Chat with the AI

- Use the chatbot to ask questions about the repository.

---

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: GitHub API, Google Gemini API
- **UI Components**: shadcn/ui, Hugeicons
- **Other Libraries**: Axios, React Markdown, date-fns

---

### Live Demo 

Check out the live demo of Reporadar: https://reporadar.example.com