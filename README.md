# MixTiers

MixTiers is an ad-free tier list maker built with Next.js. The root route redirects to `/create`, where users can upload images, arrange them into draggable tier rows, customize the layout, and export the tier list as a PNG.

## Features

- Drag images between the image pool and tier rows.
- Reorder images inside rows and reorder the rows themselves.
- Add, edit, recolor, and delete tier rows.
- Choose image shapes: original, square, circle, vertical, or horizontal.
- Configure row gap, border style, label text color, rounded rows, bold labels, row backgrounds, and image spacing.
- Toggle presentation mode for a cleaner view.
- Export the tier rows as a PNG.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Jotai
- Atlassian Pragmatic Drag and Drop
- html-to-image
- Bun

## Getting Started

Install dependencies:

```bash
bun install
```

Run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). The homepage redirects to [http://localhost:3000/create](http://localhost:3000/create).

## Environment Variables

Set `NEXT_PUBLIC_SOURCE_URL` to this repository's public GitHub URL when deploying so the source link in the app points to the right place.

Example:

```bash
NEXT_PUBLIC_SOURCE_URL=https://github.com/your-name/your-repo
```

## Scripts

```bash
bun run dev
bun run build
bun run start
bun run lint
```

## Project Structure

```text
src/app/create        Tier list creation UI and drag/drop components
src/app/ui            Shared navigation and UI controls
src/features          Jotai atoms, shared types, and utilities
public                Static icons and assets
```

## License

This project is licensed under the GNU Affero General Public License v3.0 or later. See [LICENSE](./LICENSE) for details.
