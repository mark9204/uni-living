# UniLiving Frontend - Copilot Instructions

## Big picture
- Vite + React app with Chakra UI and React Router; entry at [src/main.jsx](src/main.jsx) wraps the app in `ChakraProvider` and applies the custom theme from [src/theme.js](src/theme.js).
- Routing and page transitions live in [src/App.jsx](src/App.jsx) using `react-router-dom` and `framer-motion` (`AnimatePresence` + `motion.div`).
- Authentication state is centralized in [src/AuthContext.jsx](src/AuthContext.jsx); it reads/writes `authToken` and `refreshToken` from `localStorage`, decodes JWT claims, and exposes `login`/`logout` via `useAuth()`.
- All backend calls go through the API wrapper in [src/api/client.js](src/api/client.js). It uses `VITE_API_URL` with a fallback to `https://localhost:7177`, adds `Authorization: Bearer` headers, and handles JSON vs FormData requests.

## Key data flows
- Auth: `LoginPage` / `RegisterPage` call `apiClient.login` or `apiClient.register`, then pass tokens to `AuthContext.login` (see [src/LoginPage.jsx](src/LoginPage.jsx) and [src/RegisterPage.jsx](src/RegisterPage.jsx)).
- Role-based UI: `Navbar` shows the Upload button only for roles `Landlord` or `Owner` from the decoded JWT (see [src/Navbar.jsx](src/Navbar.jsx)).
- Properties list: [src/PropertiesPage.jsx](src/PropertiesPage.jsx) reads filters from URL search params and calls `apiClient.getPropertiesPaged(filter)`; pagination and filters are encoded into query params.
- Property details: [src/PropertyOverviewPage.jsx](src/PropertyOverviewPage.jsx) loads a property by id and resolves images at `${VITE_API_URL}/uploads/properties/prop_${id}/${filePath}`.
- Property upload: [src/UploadPropertyPage.jsx](src/UploadPropertyPage.jsx) creates the property first, then uploads images one by one using `FormData`; do not set `Content-Type` manually for image uploads (see [src/api/client.js](src/api/client.js)).

## Styling and layout conventions
- Chakra UI is the primary styling system; prefer Chakra components/props over raw CSS when adding UI.
- The yellow color scheme is customized in [src/theme.js](src/theme.js); reuse `colorScheme="yellow"` to stay consistent with existing UI.
- Global layout uses full-height Flex containers and disables scrolling at the root (see [src/index.css](src/index.css)); pages typically manage their own internal scrolling.

## Developer workflow
- Dev server: `npm run dev`
- Production build: `npm run build`
- Preview build: `npm run preview`

## Integration points and env
- Backend base URL: set `VITE_API_URL` in `.env`; default is `https://localhost:7177` if missing (see [src/api/client.js](src/api/client.js)).
- Auth tokens are stored in `localStorage` under `authToken` and `refreshToken`; keep this in sync with `AuthContext` expectations.

## Project-specific patterns
- Pages are top-level route components in [src/]; there is no separate `pages/` directory.
- Filtering and pagination are URL-driven; update `searchParams` rather than local-only state in the properties list.
