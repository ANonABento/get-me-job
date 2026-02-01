# Columbus - Job Application Assistant

Your personal job application command center. Upload your resume, match with jobs, and prepare for interviews.

## Features

- **Resume Parsing**: Upload PDF/TXT resumes and extract structured data using AI
- **Profile Management**: Edit and manage your professional information
- **Job Matching**: Paste job descriptions and get match scores
- **Resume Generation**: Generate tailored 1-page resumes for specific jobs
- **Interview Prep**: Practice with AI-powered mock interviews (text and voice)

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: SQLite (local storage)
- **AI**: Supports Ollama (free/local) or BYOK (OpenAI, Anthropic, OpenRouter)
- **PDF Parsing**: pdf-parse
- **UI**: Tailwind CSS + shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- (Optional) Ollama for free local AI

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Setting up AI

#### Option 1: Ollama (Free, Local)

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model: `ollama pull llama3.2`
3. Go to Settings in Columbus and select "Ollama"
4. Test connection

#### Option 2: Bring Your Own Key

1. Go to Settings
2. Select your provider (OpenAI, Anthropic, OpenRouter)
3. Enter your API key
4. Test connection

## Usage

1. **Upload Resume**: Go to Upload and drop your resume PDF
2. **Review Profile**: Check extracted data in My Profile, make corrections
3. **Add Job**: Go to Jobs and paste a job description
4. **Analyze Match**: Click "Analyze Match" to see how well you fit
5. **Generate Resume**: Click "Generate Resume" for a tailored 1-page PDF
6. **Practice Interview**: Go to Interview Prep and start a mock interview

## Project Structure

```
src/
├── app/           # Next.js pages and API routes
├── components/    # React components
├── lib/
│   ├── db/       # SQLite database
│   ├── llm/      # AI client
│   ├── parser/   # PDF and resume parsing
│   └── resume/   # Resume generation
└── types/        # TypeScript types
```

## Data Storage

All data is stored locally:
- `data/columbus.db` - SQLite database
- `uploads/` - Uploaded documents
- `public/resumes/` - Generated resume files

## License

MIT
