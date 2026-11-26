# ScholarSetu Project Report

**Project:** ScholarSetu — Scholarship Discovery and Financial Assistance Frontend  
**Project type:** Responsive web application frontend  
**Technology:** React, Create React App, React Router  
**Status:** Demonstration deployment on GitHub Pages  
**Demonstration URL:** <https://ysmathapathi.github.io/scholarsetu-idt/>  
**Report date:** 26 November 2026

## Abstract

ScholarSetu is a web application frontend intended to make scholarship and
financial-assistance opportunities easier to discover and understand. It
provides public information pages and user interfaces for searching
opportunities, reviewing eligibility information, managing a student profile,
tracking applications, and administering scholarship records.

The application is implemented as a React single-page application. Its
interface communicates with a separately hosted API for scholarship records,
authentication, student services, and administration. The frontend is deployed
to GitHub Pages for demonstration. Since a production API is not currently
configured, the deployed public interface can be viewed, but data-driven,
authentication, student, and administrative actions require a working backend.

## 1. Introduction

Scholarship opportunities and their eligibility criteria are often published
across different provider websites. Applicants may need to compare requirements,
keep track of deadlines, and identify the correct official application process.
ScholarSetu is designed as a central interface for organizing that discovery
process and guiding users toward provider sources.

ScholarSetu is an independent discovery tool, not a government portal. It does
not make final eligibility or award decisions. Users should confirm current
requirements with the provider and apply through the provider's official
portal.

## 2. Problem Statement

Prospective applicants can face several challenges:

- Opportunities are distributed across multiple sources.
- Eligibility requirements can be difficult to compare or interpret.
- Deadlines and application links may be easy to overlook.
- Applicants may need a clearer way to understand which profile details are
  missing before comparing opportunities.

The project addresses these challenges with a responsive discovery interface,
structured opportunity details, and a proposed profile-to-criteria workflow.

## 3. Objectives

- Provide a clear public-facing entry point for scholarship discovery.
- Allow users to search and filter opportunity records supplied by a service.
- Present source, deadline, benefit, status, and eligibility information in a
  consistent format when available.
- Provide student-facing account, profile, matching, saved-item, and
  application-tracking interfaces.
- Provide administrative interfaces for maintaining records and reviewing
  discoveries and sources.
- Display loading, empty, and error states rather than presenting invented
  scholarship data as verified information.
- Deploy the frontend as a static demonstration site.

## 4. Project Scope

### Included

- Responsive React user interface.
- Public information and account pages.
- Client-side routing and protected user/admin route experiences.
- Centralized API request utilities and authentication context.
- Scholarship discovery and management interfaces.
- GitHub Actions workflow for GitHub Pages deployment.

### Not included in this repository

- Backend API implementation or database.
- Real scholarship records or a content-ingestion service.
- Authentication provider configuration or server-side authorization.
- Final legal approval of privacy wording.

## 5. Users and Functional Areas

### Public visitors

Visitors can view the landing page, learn how the service is intended to work,
explore the scholarship directory and details, and open the About, Contact, and
Privacy pages. Login, registration, and password-reset forms are also provided.
Account operations depend on a configured API.

### Students

The student workspace includes:

- A dashboard with summary counts, recommendations, deadlines, and next steps.
- A multi-step onboarding flow and editable profile.
- Eligibility match results with statuses and criteria explanations.
- Saved scholarships and an application tracker.
- Notifications and account settings.

These features are implemented as frontend workflows and require the API to
load or save user-specific information.

### Administrators

The administration workspace includes:

- An overview of scholarship, source, and review metrics.
- Scholarship record listing, creation, and editing interfaces.
- A discovery review queue with approve, reject, and duplicate actions.
- Source registry management.
- A read-only audit log view.

Administrative permissions and all consequential changes must be enforced and
recorded by the backend. Client-side route checks are only for user experience.

## 6. Technology Stack

| Area | Technology |
|---|---|
| UI framework | React 18 |
| Build and development | Create React App (`react-scripts` 5) |
| Routing | React Router 6 with hash-based routing |
| Styling | Application stylesheet in `src/styles.css` |
| API communication | Browser Fetch API |
| Authentication state | React Context and session storage for the access token |
| Deployment | GitHub Pages via GitHub Actions |
| Runtime for builds | Node.js 20 in the deployment workflow |

No additional UI or state-management packages are listed in the project's
dependencies.

## 7. System Architecture

The frontend is a static single-page application. Its main components are:

1. **Presentation layer:** React pages and reusable UI components render forms,
   navigation, cards, tables, dialogs, status labels, and feedback states.
2. **Routing layer:** React Router maps URL fragments to public, student, and
   administrator screens. Protected routes use the current authentication
   context to guide the user.
3. **Authentication state:** `AuthContext` checks the current session, exposes
   sign-in, registration, and sign-out actions, and provides user state to
   pages.
4. **API layer:** `src/services/api.js` centralizes HTTP requests, JSON
   serialization, authorization headers, response parsing, and user-facing
   API errors.
5. **Backend service:** A separate API is expected to provide the records,
   authentication, eligibility, profile, application, notification, and
   administration functions.

The API base URL can be set using `REACT_APP_API_BASE_URL`. If it is not set,
the frontend defaults to `http://localhost:5000/api`, which is suitable for
local development but is not a reachable service for public visitors.

## 8. Main Application Routes

| Area | Routes |
|---|---|
| Public | `/`, `/how-it-works`, `/scholarships`, `/scholarships/:id`, `/about`, `/contact`, `/privacy` |
| Authentication | `/login`, `/register`, `/forgot-password` |
| Student | `/onboarding`, `/dashboard`, `/my-profile`, `/matches`, `/saved`, `/applications`, `/notifications`, `/settings` |
| Administration | `/admin`, `/admin/scholarships`, `/admin/scholarships/new`, `/admin/scholarships/:id`, `/admin/discovered`, `/admin/sources`, `/admin/audit` |

On GitHub Pages, React Router uses hash-based URLs, for example
`/#/scholarships`, so client-side navigation works on the static host.

## 9. API Integration

The frontend expects the API to support routes including:

- Authentication: `/auth/me`, `/auth/login`, `/auth/register`,
  `/auth/logout`, and `/auth/forgot-password`.
- Public discovery: `/scholarships` and `/scholarships/:id`.
- Student services: `/users/profile`, `/dashboard`,
  `/eligibility/results`, `/eligibility/check`, `/saved`, `/applications`,
  and `/notifications`.
- Contact: `/contact`.
- Administration: `/admin/overview`, `/admin/scholarships`,
  `/admin/discovered`, `/admin/sources`, and `/admin/audit`.

The exact response contracts must be agreed with and implemented by the API.
List responses may be arrays or objects containing `items` or `results`. No
sample opportunity records are bundled with the frontend.

## 10. Design, Usability, and Privacy Considerations

- The interface uses shared headers, page headings, breadcrumbs, status badges,
  form fields, and feedback components for consistency.
- Loading, error, and empty states are represented explicitly.
- Forms provide client-side validation for basic input requirements.
- Labels, semantic navigation, status roles, and alert feedback are used to
  support accessible interaction.
- The UI explains that recorded eligibility comparisons are not provider
  decisions and encourages users to confirm information with official sources.
- The profile form advises users not to enter Aadhaar numbers, bank details,
  external account passwords, or identity documents.
- Authentication and authorization remain backend responsibilities. HTTPS,
  secure token handling, data retention, and privacy compliance must be
  reviewed as part of a production backend deployment.
- The Privacy page is a draft and requires product-owner and legal review.

## 11. Build, Deployment, and Verification

### Local development

Requirements are Node.js 18 or newer and npm.

```sh
npm install
npm start
```

### Production build

```sh
npm run build
```

The production build was verified successfully during setup of the Pages
deployment. The generated static assets use the repository subpath
`/scholarsetu-idt/`.

### GitHub Pages deployment

The workflow at `.github/workflows/pages.yml` builds the frontend and publishes
the `build` directory. It deploys on pushes to `main` and can also be started
manually from GitHub Actions. The deployment completed successfully, and the
public landing page was verified at:

<https://ysmathapathi.github.io/scholarsetu-idt/>

To connect a backend, define the repository Actions variable
`REACT_APP_API_BASE_URL` as the API's HTTPS base URL and run a new deployment.

## 12. Current Limitations

- No backend API is included or configured for the public deployment.
- Scholarship listings, profile data, authentication, saved items, and other
  service-backed workflows therefore cannot operate fully on the demo site.
- No scholarship sample data is provided; this avoids presenting unverified
  records as real opportunities.
- Firebase is not configured.
- The backend response shapes and some advanced record fields still require
  agreed API contracts.
- The frontend test script exists, but this report records a successful
  production build rather than claiming a completed automated test suite.
- The privacy content is a draft and needs legal and product review.

## 13. Future Work

1. Implement and deploy the API and database contracts required by the
   frontend.
2. Add verified scholarship records with source links, review dates, and
   update procedures.
3. Integrate and test authentication, server-side role authorization, and
   account lifecycle operations.
4. Complete and validate student eligibility, saved-item, application, and
   notification workflows against the API.
5. Add backend audit and administrative authorization controls.
6. Conduct accessibility, browser compatibility, and security testing.
7. Finalize the privacy notice and operational data-retention policies.

## 14. Conclusion

ScholarSetu provides a substantial frontend foundation for a scholarship
discovery and financial-assistance service. It organizes public discovery,
student workflows, and administrative tools into a responsive React
application, and it is available as a static GitHub Pages demonstration.

The current deployment demonstrates the interface and navigation, not a
complete live service. Connecting a production-quality API, verifying
scholarship data, and implementing server-side security and authorization are
the essential next steps toward a fully operational product.
