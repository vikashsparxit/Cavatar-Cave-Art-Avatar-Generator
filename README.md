# Cavatar - Cave Art Avatar Generator

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite" alt="Vite" />
</p>

**Connect to your roots.** Generate unique, deterministic cave art avatars from any email address. Each character maps to primitive petroglyphic shapes—spirals, concentric circles, triangles, and ancient symbols.

## ✨ Features

- 🎨 **Deterministic Generation** - Same email always produces the same avatar
- 🖼️ **Multiple Formats** - Export as PNG, WEBP, or SVG
- 📐 **Flexible Sizes** - 128px, 256px, 512px (or any custom size)
- 🌌 **Background Options** - Cosmos (dark), White, or custom hex colors
- ⭕ **Shape Variants** - Rounded square, circle, or triangle avatars
- 🎯 **Smart Containment** - All elements automatically fit within any avatar shape
- ⚡ **Client-Side** - No server required, works entirely in the browser

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/vikashsparxit/cavatar.git
cd cavatar

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📦 Usage

### In Your React App

```tsx
import { generateAvatarDataURL, generateAvatarSVG } from './lib/avatarGenerator';

// Generate PNG/WEBP data URL
const pngUrl = generateAvatarDataURL('user@example.com', 256, 'cosmos', 'circle', 'png');
const webpUrl = generateAvatarDataURL('user@example.com', 256, 'cosmos', 'triangle', 'webp', 0.9);

// Generate SVG string
const svgString = generateAvatarSVG('user@example.com', 256, 'cosmos', 'triangle');

// Use in an img tag
<img src={pngUrl} alt="User Avatar" />
```

### API Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `email` | `string` | required | Email address to generate avatar from |
| `size` | `number` | `256` | Avatar dimensions in pixels |
| `background` | `'cosmos' \| 'white' \| string` | `'cosmos'` | Background style or hex color |
| `shape` | `'rounded' \| 'circle' \| 'triangle'` | `'rounded'` | Avatar shape |
| `format` | `'png' \| 'webp' \| 'jpeg'` | `'png'` | Image format (for DataURL) |
| `quality` | `number` | `0.92` | Compression quality for WEBP/JPEG (0-1) |

## 🎭 Character Mapping

Each character in the email address maps to a unique cave art element:

| Characters | Shape | Description |
|------------|-------|-------------|
| A, M, Y | Spiral | Ancient spiral motifs |
| B, N, Z | Concentric Circles | Ripple-like ring patterns |
| C, O, 0 | Line Circle | Simple circular outlines |
| D, P, 1 | Triangle | Primitive triangular shapes |
| E, Q, 2 | Dots Cluster | Scattered dot patterns |
| F, R, 3 | Wave Lines | Flowing wavy lines |
| G, S, 4 | Cross | Plus-shaped markers |
| H, T, 5 | Diamond | Rhombus shapes |
| I, U, 6 | Zigzag | Angular zigzag patterns |
| J, V, 7 | Arc | Curved arc segments |
| K, W, 8 | Star | Multi-pointed stars |
| L, X, 9 | Rays | Radiating line patterns |
| @ | Concentric | Special email symbol marker |
| . | Dots | Domain separator dots |

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── avatarGenerator.ts   # Core avatar generation logic
│   └── characterShapes.ts   # Character-to-shape mapping
├── components/
│   ├── AvatarPreview.tsx    # Avatar display component
│   ├── CharacterBreakdown.tsx # Email character visualization
│   └── ui/                  # shadcn/ui components
├── pages/
│   ├── Index.tsx            # Main generator page
│   └── CharacterMapping.tsx # Full mapping reference
└── index.css                # Design tokens & theming
```

## 🎨 Customization

### Design Tokens

The project uses CSS custom properties for theming. Edit `src/index.css`:

```css
:root {
  --primary: 175 80% 45%;
  --secondary: 325 80% 55%;
  --accent: 45 90% 55%;
  --background: 220 20% 10%;
  --foreground: 220 10% 95%;
}
```

### Avatar Style

Modify `src/lib/avatarGenerator.ts` to customize:
- Layer density and distribution
- Shape rendering styles
- Background gradients
- Crosshatch pattern density

## 📄 License

MIT License - feel free to use in personal and commercial projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔗 Links

- [Live Demo](https://cavatar.lovable.app)
- [Character Mapping Reference](/character-mapping)
- [Report Issues](https://github.com/vikashsparxit/cavatar/issues)

---

<p align="center">
  Made with ❤️ using <a href="https://lovable.dev">Lovable</a>
</p>
