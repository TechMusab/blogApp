# Folio

Folio is a responsive React blog application for discovering, saving, creating, and discussing posts.

## Features

- Browse posts by category and search the feed
- Read full articles, like posts, and add comments
- Create posts and save favourites for later
- Sign in or create a local account
- Persistent saved posts, post changes, and theme preference via `localStorage`
- Light and dark themes, with a toggle available on the dashboard, login, and sign-up pages
- Responsive layouts for desktop and mobile

## Tech stack

- React 19 and TypeScript
- Vite
- Redux Toolkit and React Redux
- React Router
- Sass

## Getting started

Prerequisites: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open the local address printed by Vite. The main application routes are:

| Route | Description |
| --- | --- |
| `/login` | Sign in |
| `/signup` | Create an account |
| `/dashboard` | Browse and search posts |
| `/posts/:id` | Read an article and join the discussion |
| `/create` | Write a post |
| `/saved-posts` | View saved posts |

## Available scripts

```bash
npm run dev      # Start the development server
npm run build    # Type-check and create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

## Theme and local data

The selected theme is applied to the document and saved as `folio:theme`. Posts and saved-post IDs are also stored locally, so changes remain after a refresh in the same browser.

To reset the demo data, clear this site's storage in your browser.
