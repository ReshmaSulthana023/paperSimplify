# AI Research Paper Explainer

AI Research Paper Explainer is a full-stack,AI application that helps users
understand research PDFs. It extracts paper content in the browser, generates
structured beginner-friendly reports, provides grounded AI chat, and saves
papers, users, profiles, and conversations in MongoDB.

The project includes a Next.js web application, an ASP.NET Core API gateway,
and a Flutter PWA that embeds the web application for a standalone app-like
experience.

## Successfully Implemented

- Secure account registration and sign-in
- Password hashing with bcrypt
- HTTP-only signed session cookies
- MongoDB-backed paper and chat history
- PDF text extraction in the browser
- Page-count detection
- Structured paper sections
- Beginner-friendly section summaries
- Keyword and highlighted-topic detection
- Grounded Groq chatbot responses
- Technical-term explanations
- English, Telugu, Hindi, Marathi, Kannada, and Tamil support
- Voice input and read-aloud controls
- Profile name and profession updates
- Paper reopening and per-user history
- Session-only uploaded-paper cards in the workspace
- Same-window structured report navigation
- ASP.NET Core 8 API gateway
- Flutter web/PWA client
- PWA installation support through Chrome
- Removed Azure Blob Storage and Azure/AWS deployment integrations

## Technology Stack

### Web Application

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- PDF.js
- Node.js

### Backend and Data

- Next.js API routes
- ASP.NET Core 8 API gateway
- MongoDB
- Mongoose
- bcryptjs
- Groq OpenAI-compatible chat API

### Client

- Flutter stable
- Flutter web/PWA

No Azure or AWS SDK, storage account, container, or deployment workflow is
required.

## Features

- Account registration and sign-in
- Secure, HTTP-only session authentication
- PDF upload and browser-based text extraction
- Beginner-friendly paper summaries
- Problem, methodology, results, findings, and limitation sections
- Keyword and topic detection
- Grounded AI chat about the uploaded paper
- Chat and paper history
- Technical-term explanations
- Voice input and read-aloud controls
- English, Telugu, Hindi, Marathi, Kannada, and Tamil support

## Architecture

```text
Flutter PWA
      |
      v
Next.js web application
      |
      v
ASP.NET Core API gateway
      |
      +--> MongoDB
      |
      +--> Groq API
```

The Next.js application is the primary web interface and owns authentication,
MongoDB access, PDF analysis, and Groq chat integration. ASP.NET Core provides
an API gateway for Flutter and external API clients. The Flutter PWA embeds the
Next.js application and provides standalone PWA installation and navigation.

## Verified Functionality

The following checks have been completed in the local environment:

| Area | Result |
|---|---|
| Next.js server | Running at `http://localhost:3000` |
| MongoDB service | Running |
| MongoDB account creation | Passed |
| Sign-in | Passed |
| Unauthenticated profile access | Rejected with `401` |
| Unauthenticated paper history | Rejected with `401` |
| Profile name update | Passed |
| Profile profession update | Passed |
| Profile read-back | Passed |
| ASP.NET Core API | Running at `http://localhost:5100` |
| ASP.NET status endpoint | Passed |
| Next.js production build | Passed |
| Flutter SDK and Chrome support | Passed |
| Flutter web/PWA production build | Passed |
| PWA manifest and service worker | Passed |
| Azure/AWS source references | Removed from application code |

## Project Structure

```text
src/
  app/
    api/                    # Authentication, papers, profile, and chat APIs
    analysis/[id]/          # Structured paper report
    history/                # Saved paper history
  components/
    paper-upload-panel.tsx  # PDF upload and report workflow
    paper-chat.tsx          # Grounded chatbot
    summary-reader.tsx      # Read-aloud summary controls
  lib/
    auth.ts                 # Session helpers
    db.ts                   # MongoDB and Mongoose models

backend-dotnet/
  PaperExplainer.Api.csproj
  Program.cs

flutter_app/
  pubspec.yaml
  lib/main.dart
  web/manifest.json
  web/index.html
  build/web/             # Generated PWA production bundle
```

## Prerequisites

- Node.js 20 or later
- npm
- MongoDB or MongoDB Atlas
- A Groq API key
- .NET 8 SDK for the API gateway
- Flutter 3.22 or later for the mobile client

## Environment Variables

Create `.env.local` in the project root:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=qwen/qwen3.8-27b
GROQ_API_BASE_URL=https://api.groq.com/openai/v1
AUTH_SECRET=a-long-random-secret
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=paper-explainer
```

Generate an authentication secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Run the Next.js Web Application

```powershell
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Run the .NET API Gateway

The .NET SDK is required to restore and run the API.

```powershell
cd backend-dotnet
dotnet run
```

By default, the service runs on a random localhost port configured by the
ASP.NET Core launcher. Set the Next.js URL explicitly:

```powershell
$env:NEXT_APP_BASE_URL="http://localhost:3000"
$env:ASPNETCORE_URLS="http://localhost:5100"
dotnet run
```

Check its status at:

```text
http://localhost:5100/api/status
```

## Run the Flutter Application

Install the Flutter SDK, then install dependencies:

```powershell
cd flutter_app
flutter pub get
```

Run the Flutter PWA in Chrome:

```powershell
flutter run -d chrome
```

Build and serve the installable production PWA:

```powershell
flutter build web --dart-define=DOTNET_API_URL=http://localhost:5100 --dart-define=NEXT_APP_URL=http://localhost:3000
cd build/web
python -m http.server 8080
```

Open `http://localhost:8080` in Chrome. Use **Install** in the Chrome address
bar or **Chrome menu > Install app** to add it to Windows.

## Share the Application for Testing

For temporary internet access, Cloudflare Tunnel can expose the local Next.js
server:

```powershell
cloudflared tunnel --url http://localhost:3000
```

Send the generated public `trycloudflare.com` URL to a tester. The URL is
temporary, changes when the tunnel restarts, and requires Next.js and MongoDB
to remain running on the host computer.

For permanent and reliable sharing, deploy the Next.js application to a public
hosting platform such as Vercel and add MongoDB Atlas plus the required Groq
environment variables.

## Database Structure

### Users

- Name
- Email
- Bcrypt password hash
- Profession
- Creation and update timestamps

### Papers

- Owner user ID
- File name
- Page count
- Summary
- Highlights
- Keywords
- Section summaries
- Report sections
- Extracted text corpus
- Visual-page data
- Upload timestamps

### Chat Messages

- Paper ID
- Owner user ID
- User or assistant role
- Message text
- Source snippets
- Creation timestamp

## Production Build

```powershell
npm run lint
npm run build
npm run start
```

Build the Flutter PWA:

```powershell
cd flutter_app
flutter build web --dart-define=DOTNET_API_URL=http://localhost:5100 --dart-define=NEXT_APP_URL=http://localhost:3000
```

The generated files are stored in `flutter_app/build/web`.

## Final Verification Checklist

Before demonstrating or sharing the application, verify:

1. MongoDB is running.
2. `.env.local` contains valid Groq and MongoDB values.
3. Next.js responds at `http://localhost:3000`.
4. `.NET` responds at `http://localhost:5100/api/status`.
5. Account registration creates a MongoDB user.
6. Sign-in opens the paper workspace.
7. Profile name and profession can be updated.
8. A PDF opens and produces a structured report.
9. Going back to the workspace shows the session paper.
10. History opens previously saved papers for the signed-in user.
11. Chat questions receive grounded paper responses.
12. The Flutter PWA responds at `http://localhost:8080`.

## Security

- Passwords are hashed with bcrypt.
- Authentication sessions use signed, HTTP-only cookies.
- Paper and chat APIs verify the logged-in user.
- Groq credentials remain server-side.
- MongoDB credentials and API keys must not be committed to source control.

## External Services

- **Groq** - Streaming text and vision-capable AI answers
- **MongoDB** - Persistent application storage
- **PDF.js** - Browser PDF text extraction
- **Browser APIs** - Speech recognition and text-to-speech
