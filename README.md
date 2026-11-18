# AI Research Paper Explainer

AI Research Paper Explainer is a full-stack web application that helps students,
researchers, and beginners understand uploaded research papers. The application
extracts PDF content, generates beginner-friendly summaries, stores paper and chat
data, and provides grounded AI answers through a Groq-powered chatbot.

The application supports text, tables, graphs, figures, diagrams, and page images
from PDF documents. It also includes technical-word explanations, voice input,
text-to-speech, account management, and saved paper history.

## Key Features

- Public application landing page
- User registration and sign-in
- Secure session-based authentication
- Password hashing with bcrypt
- PDF drag-and-drop upload
- Browser-based PDF text extraction
- PDF page rendering for visual analysis
- Page-count detection
- Abstract and paper-summary generation
- Problem, objective, methodology, findings, and limitation sections
- Keyword and highlighted-topic detection
- Grounded question answering from uploaded paper content
- Keyword-based relevant passage retrieval
- Relevant PDF-page retrieval for table, graph, chart, figure, and diagram questions
- Groq large language model integration
- Streaming chatbot responses
- Chat history saved per paper
- Paper history and account profile pages
- Technical-term hover and keyboard-focus definitions
- Browser voice input
- Read-aloud, pause, resume, and stop controls
- English, Telugu, Hindi, Marathi, Kannada, and Tamil language options
- Responsive desktop and mobile interface
- MongoDB storage for users, papers, analysis, visual pages, and chat messages

## Technologies Used

### Frontend

- **Next.js 16** - React application framework and App Router
- **React 19** - Component-based user interface
- **TypeScript** - Application and API type safety
- **Tailwind CSS 4** - Responsive styling and layout
- **CSS** - Global styles and browser defaults
- **Next.js Server Components** - Server-rendered pages and session checks
- **Next.js Client Components** - Interactive upload, chat, voice, and tooltip features

### Backend

- **Next.js API Routes** - Authentication, paper storage, profile, and chat APIs
- **Node.js** - Server runtime
- **Groq OpenAI-Compatible API** - Streaming AI chat completions
- **Groq Qwen model** - Primary large language model
- **Groq GPT OSS fallback model** - Alternate chat completion model
- **MongoDB** - Persistent application database
- **Mongoose** - MongoDB schemas and database operations
- **bcryptjs** - Password hashing
- **HTTP-only cookies** - Session authentication
- **HMAC-SHA256** - Signed session-token validation

### PDF and Document Processing

- **PDF.js** - PDF loading and text extraction
- **PDF.js Canvas Rendering** - Page image generation for visual questions
- **Canvas API** - Browser-side page rendering
- **JPEG compression** - Compact storage of rendered PDF pages
- **Keyword scoring** - Relevant text and visual-page retrieval
- **Sentence and section analysis** - Simple research-paper summaries

### Speech and Accessibility

- **Web Speech Recognition API** - Microphone voice input
- **Speech Synthesis API** - Read-aloud functionality
- **Semantic HTML** - Structured headings and sections
- **ARIA labels** - Accessible controls and tooltips
- **Keyboard focus states** - Accessible navigation and term definitions
- **Viewport-aware tooltips** - Definitions that remain visible on screen

### Development and Build Tools

- **npm** - Dependency and script management
- **ESLint** - Code-quality checks
- **TypeScript compiler** - Static type checking
- **Turbopack** - Next.js development and build bundler
- **MongoDB Compass** - Local database inspection
- **MongoDB Atlas** - Optional cloud database hosting

## System Architecture

1. The user registers or signs in.
2. The user selects or drags a PDF into the uploader.
3. The browser reads the PDF with PDF.js.
4. PDF text is converted into sentences and keyword corpus entries.
5. PDF pages are rendered into compressed images for visual analysis.
6. The analysis is stored in MongoDB with the paper metadata.
7. The application creates a section-wise beginner-friendly summary.
8. A paper-specific analysis page opens in a new tab.
9. The chatbot retrieves relevant text and page context.
10. Groq generates a grounded streamed response.
11. Chat messages and source snippets are saved in MongoDB.

## Database Structure

The MongoDB database name is `paper-explainer` by default.

### Users

Stores:

- Name
- Email
- Bcrypt password hash
- Profession
- Account timestamps

### Papers

Stores:

- User ID
- File name
- Page count
- Summary
- Highlights
- Detected keywords
- Section summaries
- Report sections
- Extracted text corpus
- Rendered visual-page data
- Upload timestamps

### Chat Messages

Stores:

- Paper ID
- User ID
- User or assistant role
- Message text
- Retrieved source snippets
- Message timestamps

## Project Structure

```text
src/
  app/
    page.tsx                  # Public landing page and signed-in dashboard
    login/                    # Sign-in page
    register/                 # Account-registration page
    profile/                  # User profile page
    history/                  # Saved paper history
    analysis/[id]/            # Paper summary and chatbot page
    api/
      auth/                   # Login, logout, and registration APIs
      papers/                 # Paper save, read, and history APIs
      chat/                   # Groq streaming and chat-history APIs
      profile/                # Profile updates
  components/
    paper-upload-panel.tsx    # PDF upload and analysis workflow
    paper-chat.tsx            # Grounded chatbot and speech controls
    summary-reader.tsx        # Read-aloud summary controls
    technical-text.tsx        # Technical-word glossary tooltips
    logout-button.tsx         # Session sign-out control
  lib/
    auth.ts                   # Session and authentication helpers
    db.ts                     # Mongoose models and database connection
```

## Environment Variables

Create or update `.env.local` in the project root:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=qwen/qwen3.8-27b
GROQ_API_BASE_URL=https://api.groq.com/openai/v1

AUTH_SECRET=a-long-random-secret

MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=paper-explainer

AZURE_STORAGE_CONNECTION_STRING=
AZURE_BLOB_CONTAINER=research-papers
```

For MongoDB Atlas, replace `MONGODB_URI` with an Atlas connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

For Azure Blob Storage, add the storage account connection string to
`AZURE_STORAGE_CONNECTION_STRING`. Uploaded PDFs are stored privately in the
`research-papers` container by default. The container name can be changed with
`AZURE_BLOB_CONTAINER`.

## Azure App Service Deployment

The repository includes an Azure App Service deployment workflow and a
standalone Docker build:

- `Dockerfile` - Builds and runs the Next.js standalone server
- `.github/workflows/azure-app-service.yml` - Builds an image and deploys it
- `.env.azure.example` - Azure environment-variable template

Configure these GitHub repository secrets before deployment:

```text
AZURE_CREDENTIALS
AZURE_RESOURCE_GROUP
```

Configure these application settings in Azure App Service:

```text
GROQ_API_KEY
GROQ_MODEL
GROQ_API_BASE_URL
AUTH_SECRET
MONGODB_URI
MONGODB_DB_NAME
AZURE_STORAGE_CONNECTION_STRING
AZURE_BLOB_CONTAINER
WEBSITES_PORT=3000
```

Push to `main` or run the workflow manually to deploy. Azure App Service can use
the MongoDB Atlas database and Azure Blob Storage while keeping Groq server-side.

The Atlas cluster's network access list must include the public IP of the server
running this application.

## Run Locally

Install dependencies:

```bash
npm install
```

Start MongoDB locally or configure MongoDB Atlas.

Start the Next.js development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Create a Production Build

```bash
npm run build
npm run start
```

## Available Scripts

```bash
npm run dev       # Start the development server
npm run build     # Create and type-check a production build
npm run start     # Start the production server
npm run lint      # Run ESLint
```

## Security Notes

- Passwords are hashed before database storage.
- Authentication sessions use signed, HTTP-only cookies.
- Paper and chat APIs verify the logged-in user.
- Paper records are associated with their owning user ID.
- The Groq API key remains server-side and is not exposed to the browser.
- MongoDB Atlas credentials and API keys should never be committed to source control.

## External Services

- **Groq** - Streaming text and vision-capable LLM responses
- **MongoDB / MongoDB Atlas** - Persistent application data
- **Browser APIs** - PDF processing, speech recognition, and text-to-speech
