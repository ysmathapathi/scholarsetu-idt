# ScholarSetu frontend

Responsive React frontend for discovering scholarships and financial-assistance schemes. This project uses Create React App and React Router.

## Requirements

- Node.js 18 or newer
- npm
- A ScholarSetu API service. By default the frontend expects `http://localhost:5000/api`.

## Run locally

```sh
npm install
npm start
```

Set `REACT_APP_API_BASE_URL` before starting the development server to use a different API base URL, for example `http://localhost:5000/api`.

## Build

```sh
npm run build
```

## API integration

Requests are centralized in `src/services/api.js`. The UI expects a backend to provide the endpoints described in the ScholarSetu frontend specification, including `/auth/me`, `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/forgot-password`, `/scholarships`, `/users/profile`, `/eligibility/results`, `/saved`, `/applications`, `/notifications`, `/contact`, and the `/admin/*` endpoints. Exact response shapes should be agreed with the backend; list responses may be arrays or objects containing `items` or `results`.

No sample scholarship records are bundled. When the API is unavailable, the UI shows an explicit loading, empty, or error state rather than invented opportunities. Authentication and administrator authorization must be enforced by the backend; client-side route checks are only for user experience.

## Known limitations

- Firebase is not configured in this repository. Login, registration, and password reset require the corresponding backend API.
- Profile, eligibility, application tracker, notifications, contact, and admin actions require their suggested API endpoints.
- The privacy page is explicitly a draft for product-owner and legal review.
- Some advanced record fields and admin source/discovery actions require matching backend contracts before they can be fully enabled.
