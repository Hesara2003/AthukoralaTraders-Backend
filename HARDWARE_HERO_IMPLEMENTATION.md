# Hardware Hero Component - Implementation Guide

## Overview
This document describes the implementation of an animated hero section for Athukorala Traders' hardware store website. The hero features floating parallax images and animated rotating text.

## What Was Implemented

### 1. **Project Structure Setup**
Created the following directories:
- `/src/components/ui` - For reusable UI components (shadcn-style structure)
- `/src/lib` - For utility functions
- `/src/hooks` - For custom React hooks

### 2. **Dependencies Installed**
```bash
npm install motion
```
- `motion` - Modern animation library (successor to framer-motion)
- `clsx` - Already installed for className utilities

### 3. **Core Files Created**

#### Utilities
- **`src/lib/utils.js`** - Utility function for merging className strings
  - `cn()` function for combining Tailwind classes

#### Custom Hooks
- **`src/hooks/use-mouse-position-ref.js`** - Mouse position tracking hook
  - Tracks mouse and touch positions
  - Works relative to container or globally
  - Used by parallax floating effect

#### UI Components
- **`src/components/ui/text-rotate.jsx`** - Animated text rotation component
  - Rotates through array of text strings
  - Character-by-character animation with stagger effects
  - Configurable timing, transitions, and split behaviors
  - Supports emoji and unicode characters

- **`src/components/ui/parallax-floating.jsx`** - Parallax floating effect
  - Creates depth-based parallax movement
  - Smooth easing animations
  - Context-based element registration
  - Mouse position-responsive

#### Main Component
- **`src/components/HardwareHero.jsx`** - Hardware-themed hero section
  - 5 floating hardware tool images from Unsplash
  - Animated text with rotating adjectives
  - Two CTA buttons (Shop Now, Learn More)
  - Responsive design for mobile, tablet, and desktop
  - Hardware-specific content and styling

### 4. **Integration**
Modified `src/pages/Homepage.jsx`:
- Imported HardwareHero component
- Replaced old hero carousel with new animated hero
- Maintained banner section above hero

## Component Features

### HardwareHero
**Props:** None (fully self-contained)

**Features:**
- 5 floating images with different parallax depths
- Animated text: "Build your projects [rotating word]"
- Rotating words: better, stronger 💪, faster, smarter, 🔨 right, perfect ✨, pro 🔧, solid 🏗️, reliable, 🛠️ easy, quality ⭐, tough 🔩, precise 📐
- Full-screen height section
- Gradient background
- Two action buttons linking to /products and /about

### TextRotate Component
**Key Props:**
- `texts` - Array of strings to rotate through
- `rotationInterval` - Milliseconds between rotations (default: 2000)
- `staggerDuration` - Delay between character animations
- `staggerFrom` - Animation direction ('first', 'last', 'center', 'random')
- `splitBy` - How to split text ('characters', 'words', 'lines')
- `loop` - Whether to loop back to start

### Floating & FloatingElement Components
**Floating Props:**
- `sensitivity` - Parallax effect strength (default: 1)
- `easingFactor` - Smoothness of movement (default: 0.05)

**FloatingElement Props:**
- `depth` - How much the element moves (higher = more movement)
- `className` - Position and styling classes

## Hardware Images Used
All images from Unsplash (free to use):
1. Power Tools
2. Hardware Tools Collection
3. Drill and Construction Tools
4. Measuring Tools
5. Screws and Fasteners

## Customization Guide

### Change Rotating Text
Edit `src/components/HardwareHero.jsx`:
```jsx
<TextRotate
  texts={[
    "your-word-1",
    "your-word-2",
    // Add more...
  ]}
  // ... other props
/>
```

### Change Images
Replace URLs in `hardwareImages` array:
```jsx
const hardwareImages = [
  {
    url: "your-image-url",
    title: "Image description",
  },
  // Add more...
]
```

### Adjust Parallax Sensitivity
In HardwareHero:
```jsx
<Floating sensitivity={-0.5}> // Negative for reverse direction
```

In FloatingElement:
```jsx
<FloatingElement depth={2}> // Higher = more movement
```

### Change Colors
Main colors used:
- Primary: `blue-600` (text-blue-600, bg-blue-600)
- Background: `gray-50` to `white` gradient
- Buttons: `gray-900` and `blue-600`

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile touch support included
- Graceful fallbacks for older browsers
- Uses Intl.Segmenter with fallback for character splitting

## Performance Considerations
- Uses `useAnimationFrame` for smooth 60fps animations
- Transform3d for GPU acceleration
- will-change-transform for optimization
- Lazy motion calculations only when needed

## Next Steps (Optional Enhancements)
1. Add loading states for images
2. Add accessibility improvements (reduced motion support)
3. Add more floating images for richer effect
4. Create theme variants (dark mode)
5. Add scroll-triggered animations

## Troubleshooting

### Images not loading
- Check Unsplash URLs are valid
- Ensure internet connection for external images
- Consider hosting images locally for production

### Animation performance issues
- Reduce `easingFactor` for less frequent updates
- Reduce number of FloatingElements
- Lower `sensitivity` value

### Text not rotating
- Check `texts` array has multiple items
- Verify `auto={true}` prop is set
- Check console for errors

## File Structure
```
src/
├── components/
│   ├── HardwareHero.jsx (Main hero component)
│   └── ui/
│       ├── text-rotate.jsx (Text animation)
│       └── parallax-floating.jsx (Parallax effect)
├── hooks/
│   └── use-mouse-position-ref.js (Mouse tracking)
├── lib/
│   └── utils.js (Utility functions)
└── pages/
    └── Homepage.jsx (Integrated hero)
```

## Dependencies Summary
```json
{
  "motion": "latest",
  "clsx": "^2.1.1",
  "lucide-react": "^0.544.0",
  "react": "^19.1.1",
  "react-router-dom": "^7.9.1",
  "tailwindcss": "^4.1.13"
}
```

---

**Implementation Date:** November 18, 2025
**Status:** ✅ Complete and tested
