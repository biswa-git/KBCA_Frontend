# KBCA Website - React.js Version

A professional, responsive React.js implementation of the Kondapur Bengali Cultural Association (KBCA) website. This project transforms the original HTML/CSS design into a modern React application with full responsiveness across desktop, tablet, and mobile devices.

## Features

- ✨ **Elegant Design** - Preserves the original aesthetic with gold and cream color scheme
- 📱 **Fully Responsive** - Desktop, tablet, and mobile optimized
- 🎨 **Custom Cursor** - Interactive cursor with smooth animations
- 🔄 **Scroll Animations** - Smooth reveal effects as you scroll
- ⚡ **Built with Vite** - Fast development and production builds
- 🎭 **React Components** - Modular, maintainable component structure
- 🎵 **Bengali Typography** - Support for Bengali fonts (Noto Serif Bengali)
- 🌐 **Semantic HTML** - Accessible and SEO-friendly markup

## Sections

- **Hero** - Welcome banner with call-to-action
- **About** - Community story and Tagore quote
- **Events** - Upcoming celebrations including Durga Puja
- **Programs** - Cultural initiatives and classes
- **Join CTA** - Membership and volunteer opportunities
- **Footer** - Links and social connections

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Styling with responsive design
- **Google Fonts** - Cormorant Garamond, DM Sans, Noto Serif Bengali

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint checks

## Build for Production

```bash
npm run build
```

The optimized production files will be in the `dist` folder.

## Project Structure

```
src/
├── components/
│   ├── Navigation.tsx    - Header navigation
│   ├── Hero.tsx          - Hero section
│   ├── About.tsx         - About section with Tagore quote
│   ├── Events.tsx        - Events grid
│   ├── Programs.tsx      - Cultural programs
│   ├── JoinCTA.tsx       - Join community CTA
│   ├── Footer.tsx        - Footer with social links
│   └── CustomCursor.tsx  - Custom cursor implementation
├── hooks/
│   └── useScrollReveal.ts - Scroll animation hook
├── App.tsx               - Main app component
├── main.tsx              - React entry point
└── index.css             - Global styles and responsiveness

```

## Responsive Design

The website is fully responsive with breakpoints at:

- **Desktop**: 1024px and above
- **Tablet**: 768px to 1023px  
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

Key responsive features:
- Navigation adapts for mobile screens
- Grid layouts transform to single columns
- Font sizes use `clamp()` for fluid scaling
- Touch-friendly button sizes on mobile

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Colors

Edit the CSS variables in `src/index.css`:

```css
:root {
  --gold: #C9A84C;
  --ink: #0A0A0A;
  --cream: #FAF7F2;
  /* ... other colors */
}
```

### Fonts

Google Fonts are imported in `index.html`. You can change them in the `<link>` tags.

### Content

Edit the component files in `src/components/` to update content, images, or structure.

## Performance

- Optimized images and SVG graphics
- Code splitting with Vite
- Lazy component loading ready
- Smooth scroll animations with Intersection Observer API

## License

© 2026 Kondapur Bengali Cultural Association

## Contact

- Email: officialkbca@gmail.com
- Facebook: [KBCA](https://www.facebook.com/profile.php?id=61589405496972)
- Instagram: [@_kbcaofficial](https://www.instagram.com/_kbcaofficial/)
