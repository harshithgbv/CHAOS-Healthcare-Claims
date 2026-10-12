# CHAOS — Suspicious Healthcare Claims Detection

**HackSprint 2026 | Problem ID: DL-VVCE-HK26-HLS001**

CHAOS (Claims Handling Anomaly Optimization Squad) is a healthcare claims analysis prototype designed to identify suspicious billing patterns, duplicate claim candidates, and data-quality issues for human review.

## Problem Statement

Healthcare claims may contain duplicate submissions, incomplete information, invalid amounts, or unusual billing patterns. Manually reviewing every claim can be time-consuming.

CHAOS demonstrates how rule-based analysis can help prioritize claims that may require further investigation.

## Key Features

- **Duplicate Detection:** Identifies exact and potential duplicate claim candidates.
- **Billing Anomaly Detection:** Flags unusually high claim amounts relative to the comparison average for the same procedure.
- **Data Quality Validation:** Detects missing procedure codes, invalid amounts, and invalid service dates.
- **Priority Scoring:** Assigns a capped priority score based on detected conditions.
- **Claims Dashboard:** Provides a user interface for exploring and reviewing claims.
- **Tested Detection Logic:** Includes automated checks for normal claims, duplicates, invalid data, and outliers.

## Technology Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Node.js / Express
- Google Gemini API integration

## Getting Started

### Prerequisites

- Node.js and npm
- Git
- A Gemini API key if you use features that require the Gemini API

### Installation

Clone the repository:

```bash
git clone https://github.com/harshithgbv/CHAOS-Healthcare-Claims.git
cd CHAOS-Healthcare-Claims
```

Install dependencies:

```bash
npm install
```

Configure the environment variables required by the application. Use `.env.example` as a reference, and keep your actual credentials in a local `.env` file that is never committed to Git.

Start the development server:

```bash
npm run dev
```

## Run Tests

Execute the detection-engine tests:

```bash
npm test
```

Check TypeScript:

```bash
npm run lint
```

Build for production:

```bash
npm run build
```

## How Detection Works

The current prototype uses rule-based checks to identify:

1. Missing or invalid claim information.
2. Exact duplicate candidates based on matching claim fields.
3. Potential duplicates with matching patient, provider, date, and similar amount but different procedure codes.
4. High-amount outliers compared with other positive claims for the same procedure.

Detected claims receive flags and a priority score capped at 100.

## Important Disclaimer

CHAOS is a prototype for anomaly detection and review prioritization. A flagged claim is **not proof of fraud**. Its findings require human review and appropriate validation before real-world use.

Use synthetic or properly authorized, de-identified data for demonstrations. Never publish patient-identifiable information or API credentials.

## Project Information

- **Project:** CHAOS — Claims Handling Anomaly Optimization Squad
- **Event:** HackSprint 2026
- **Problem:** Suspicious Healthcare Claims
- **Problem ID:** DL-VVCE-HK26-HLS001

## Future Improvements

- Statistical and machine-learning anomaly detection
- Improved detection using historical billing patterns
- Explainable risk scoring
- More comprehensive automated testing
- Evaluation using labeled, appropriately governed datasets
- Improved reviewer workflows and reporting

---

*Built as a hackathon prototype for suspicious healthcare claims analysis.*
