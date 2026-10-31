# BookNook

**Live site:** https://borrowbook-client.vercel.app

BookNook is a community library for discovering books, sharing your own titles, and keeping track of borrowed books. The client is built with Next.js App Router, React, TypeScript, and Tailwind CSS. Authentication uses Better Auth; book and borrow data is served by the companion Express and MongoDB API.

## Features

- Browse a responsive catalog of books and open detail pages with availability information.
- Discover the six most recently added books on the home page, alongside a Swiper banner and borrowing guide.
- Create an account, sign in with email and password, and edit your profile.
- Add, update, and remove your own books from a private collection.
- Borrow available books, see return dates, and return active loans from your account.
- Keep your signed-in session across reloads and return to the private page you originally requested after login.
- Get inline validation, accessible loading states, and toast feedback for errors and successful actions.

## Local setup

1. Install dependencies with `npm install`.
2. For local development, copy `.env.local.example` to `.env.local`.
3. Start the companion Express API with its own environment variables and MongoDB connection.
4. Start the client with `npm run dev`, then open [http://localhost:3000](http://localhost:3000).

The client expects the existing Express API to provide `POST /jwt`, the eight `/books` and `/borrows` routes, and Better Auth endpoints under `/api/auth`. Both route groups go through same-origin Next.js rewrites so Better Auth session cookies work across separate Vercel projects. Set `SERVER_API_URL` to the backend origin in Vercel Preview and Production; existing deployments with `NEXT_PUBLIC_API_URL` continue to work as a fallback. Keep MongoDB and Better Auth secrets in the backend environment only.

## Scripts

- `npm run dev` — start the Next.js development server.
- `npm run build` — create a production build.
- `npm run start` — serve a production build.
- `npm run lint` — run ESLint.

## Deployment

Deploy the Next.js client and existing Express API as separate Vercel projects. Set the client’s `SERVER_API_URL` to the deployed backend origin. On the backend, configure MongoDB, JWT, Better Auth, and `CLIENT_URL` with the deployed client origin. Google sign-in also requires Google OAuth credentials and a Google provider configured on the server.
