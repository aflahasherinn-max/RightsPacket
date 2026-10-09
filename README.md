# RightsPocket — Hackathon MVP

A student-focused legal-awareness web app built with React + Vite and Python + Flask.

## Features
- Browse common student issue categories
- Search legal issue guides using keyword matching and relevance ranking
- View plain-language practical next steps and official source links
- Browse short legal-awareness flashcards
- Generate, copy and download a general request/complaint draft
- Find official legal-aid and grievance resources
- Responsive modern dashboard

## Requirements
- Node.js (LTS recommended)
- Python 3.10+
- VS Code or another editor

## 1. Run the backend (Terminal 1)

From the project root:

```bash
cd backend
python -m venv venv
```

Windows PowerShell:
```powershell
.\venv\Scripts\Activate.ps1
```

Windows Command Prompt:
```bat
venv\Scripts\activate
```

macOS/Linux:
```bash
source venv/bin/activate
```

Then install and run:
```bash
pip install -r requirements.txt
python app.py
```

The backend runs at http://127.0.0.1:5000

Check it by opening http://127.0.0.1:5000/api/health. It should return JSON with status "ok".

## 2. Run the frontend (Terminal 2)

Open a second terminal in the project root:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173.

## 3. Test the MVP
1. On the home page, search for "deposit", "internship", "college", or "refund".
2. Open a guide and check the practical steps and official source link.
3. Open Learn Daily and browse the flashcards.
4. Open Document Generator, enter sample details, generate a draft, then copy or download it.
5. Open Find Legal Help and test the official links.

## API endpoints
- `GET /api/health`
- `GET /api/issues`
- `GET /api/search?q=deposit`
- `GET /api/flashcards`
- `GET /api/resources`
- `POST /api/generate-document`

Example request body for document generation:
```json
{
  "full_name": "Demo Student",
  "recipient": "Hostel Office",
  "date": "2026-10-09",
  "issue": "Request for resolution",
  "details": "My deposit has not been returned after move-out.",
  "amount": "5000"
}
```

## Legal-content and safety notes
- This is a hackathon prototype, not a legal-advice service.
- The issue guides are general practical steps. They do not assert that a law has been violated or guarantee an outcome.
- Source links point to official portals, but this prototype does not automatically verify which section applies to each user's facts.
- Before a public launch, have the content reviewed by a qualified Indian legal professional; add citations to specific, current statutory provisions and update them periodically.
- Do not collect sensitive personal information in a public demo. The MVP does not store form data in a database.
- The draft generator creates a basic template, not a lawyer-reviewed legal notice.
- The current search is keyword-based, not a trained AI model.

## Suggested 1–2 day plan
- First half-day: run the app and customise branding/content.
- Second half-day: test the guide and document generator.
- Day 2: polish the mobile layout, add verified source-specific references, rehearse the demo, and prepare slides.
