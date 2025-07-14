Alexvera.work Design System: Starter Kit
This document serves as a living reference, consolidating the core principles, design tokens, component guidelines, and best practices extracted from your existing codebase. Use it to ensure consistency and accelerate development when building future pages that perfectly align with the distinctive alexvera.work style.
CORE FOUNDATIONS
1. Brand Voice & Mood
Our design language embodies a Modern FinTech aesthetic, characterized by:
Color Palette: Crisp blue primary, clean whites, and elegant dark-mode neutrals.
Accents: Subtle neon and glassmorphism elements add polish.
Motion: Animations convey sophistication without distraction. Transitions predominantly use ease or spring curves, with durations ranging from 200 to 600 milliseconds.
2. Design Tokens (Single Source of Truth)
Design tokens are defined once and imported across all platforms (Tailwind, CSS-in-JS, Chart.js palettes, Figma styles) to ensure unified styling.
colors.js
export const colors = {
  /* Brand */
  primary:      '#2563eb',   // blue-600
  primaryLight: '#93c5fd',  // blue-300
  primaryDark:  '#1e40af',  // blue-800

  accent:   '#f97316',   // orange-500 (highlight)
  success:  '#22c55e',   // green-500
  danger:   '#ef4444',   // red-500

  /* Neutrals */
  text:         '#1f2937', // gray-800
  textLight:    '#4b5563', // gray-600
  surface:      '#ffffff',
  surfaceDark:  '#111827', // gray-900
  glass: 'rgba(255,255,255,.1)',

  /* Shadows / borders */
  ring:   'rgba(37, 99, 235, .4)' // brand ring focus
};



Tailwind Usage
To integrate these colors into your Tailwind CSS configuration, add them to tailwind.config.js:
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        accent:  colors.accent,
        // ... include other colors from colors.js as needed
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Inter', 'ui-sans-serif'] // For prominent headings
      }
    }
  }
};



3. Typography Scale
Our typography uses the Inter font, with standard sans-serif fallbacks.
Style
Tailwind Class
Font Size / Line Height (px)
Weight
Heading XL
text-6xl
72 / 80
Bold
Heading L
text-4xl
48 / 56 (Hero, H1)


Heading M
text-3xl
36 / 44 (Section H2)


Heading S
text-2xl
24 / 32 (H3)


Body L
text-lg
18 / 28


Body M
text-base
16 / 24 (Default)


Body S
text-sm
14 / 20


Caption
text-xs
12 / 16



Guidelines:
Use the font-heading utility for H1-H3 if registered in Tailwind.
Headings should generally have a line-height between 1.25 and 1.4.
Prose (body text) should use a line-height between 1.5 and 1.75.
Paragraphs should ideally be limited to approximately 65 characters per line using max-w-prose for optimal readability.
4. Spacing & Layout
Base Grid: We adhere to a 4-point base grid (e.g., p-1 corresponds to 4 pixels).
Section Vertical Rhythm:
Desktop: py-16
Tablet: py-12
Mobile: py-8
Page Container: Use the responsive container classes: .container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl.
Card/Surface Radius: All cards and surfaces use rounded-xl (0.75rem).
Glass Cards: Achieve the glass effect with backdrop-filter: blur(10px) combined with the tokenized glass color.
5. Elevation & Interaction
Shadow Tiers (Tailwind):
Card Resting: shadow-md/20
Card Hover: shadow-xl/30 combined with scale-105 transformation.
Focus Ring: Interactive elements feature a clear focus state: focus:ring-2 focus:ring-primary.
6. Dark Mode
Dark mode is activated by adding the dark class to the <html> element.
Always pair a light-mode class with a corresponding dark: variant.
Neutral Text Example: text-gray-700 dark:text-gray-300
Surface Example: bg-white dark:bg-surfaceDark
COMPONENT LIBRARY (ATOM → ORGANISM)
This section outlines common components and their styling guidelines.
1. Buttons
<button class="
  inline-flex items-center justify-center gap-2
  px-5 py-2.5 rounded-lg font-medium
  text-white bg-primary hover:bg-primaryDark
  focus:outline-none focus:ring-2 focus:ring-primary
  disabled:opacity-40 disabled:cursor-not-allowed
  transition-all duration-200
">
  Label
</button>



Variants: outline, ghost, icon (which uses p-2 and is square).
2. Navbar
Positioning: Fixed at the top, featuring a blurred glass effect (backdrop-blur-md).
Dynamic Height: Its vertical padding shrinks from py-4 to py-2 after scrolling down 50 pixels.
Active Link Indicator: Utilizes Framer-Motion's layoutId="navIndicator" for smooth transitions.
Mobile Menu: Slides into view using AnimatePresence.
(Content for src/components/layout/Navbar.jsx would appear here if available.)
3. Card
Cards feature a glassmorphic surface and are outlined with a neon primary border (border-primary).
Interactive Tilt: A JavaScript-driven 3D tilt effect responds to mouse movement, with a maximum tilt of 5 degrees.
Entrance Animation: Cards appear with an IntersectionObserver-triggered slide and fade effect (opacity 0 to 1, translateY 50 to 0 over 600ms).
(Content for src/components/layout/Card.jsx and src/components/layout/Card.css would appear here if available.)
4. Bento Grid
The Bento Grid employs a responsive column layout:
grid-cols-1 for mobile
sm:grid-cols-2 for small screens and up
lg:grid-cols-3 for large screens and up
All cells have a gap-6.
Each cell within the Bento Grid should wrap a Card component, and its children should be self-contained.
5. DarkModeToggle
Thumb Animation: The toggle's thumb is a motion.div element, animated with a spring effect (stiffness 300, damping 20).
Placement: Typically found inside the navigation bar for desktop, or adjacent to the burger menu icon on mobile.
(Content for src/components/layout/DarkModeToggle.jsx would appear here if available.)
6. Blog & Article
List View: Articles are presented as cards with an image at the top and a metadata row (flex items-center text-sm).
Detail View: Features a hero image with a fixed height (h-64) and content constrained within a max-w-4xl container.
Rich Text: HTML content is sanitized and styled using the prose utility (add dark:prose-invert if using @tailwindcss/typography).
7. Infographics & Data Viz
Color Palette: Chart.js palettes are mapped directly to our design tokens (primary, primaryLight, accent).
Scales: Use a logarithmic scale for the Y-axis (y.type='logarithmic') when numbers wildly differ.
Consistency: Legends are placed at the bottom, and font styles match the rest of the UI.
ANIMATION & MOTION
Our primary animation library is Framer Motion.
Common Variants
export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: .6 } }
};



Pattern
Sections: Apply initial="hidden" whileInView="visible" along with viewport={{ once:true, amount:.2 }} to animate sections as they enter the viewport.
Hover Micro-interactions: Common interactions include scale-1.05 or y-2 (for link raising), lasting 200ms.
Ease Curves: Avoid ease-in on entry animations; prefer ease-out or spring for a more natural feel.
Performance
Prefers-reduced-motion: Wrap animations with a media query or use the reduceMotion='user' prop on motion.div to respect user preferences.
ACCESSIBILITY CHECKLIST
To ensure an inclusive user experience:
Interactive Elements: All interactive elements (e.g., DarkModeToggle, back-to-top buttons) must have an aria-label.
Focus States: Ensure focus states are clearly visible (e.g., using ring-primary).
Color Contrast: Maintain a minimum color contrast ratio of ≥4.5:1. Test primary color against both surface and dark mode backgrounds.
Navbar Links (Mobile): On mobile, Navbar links should be implemented as buttons to provide correct tap targets.
Smooth Scroll: Custom scrollToSection functions should retain keyboard scroll support.
FUTURE EXTENSION TIPS
To further enhance and scale the design system:
Tokenize Everything: Create a dedicated /src/styles/tokens.css (or .js/.ts file) and reference it in your Tailwind extend configuration and JavaScript constants. A single edit will then update styles across the board.
Extract Motion Variants: Consolidate shared Framer Motion variants into a utility file, e.g., /src/utils/motion.js.
Create Primitive Components: Build foundational components like <Surface>, <Heading>, and <Text> that apply design tokens. Then, construct more complex components from these primitives.
Extend Tailwind: Incorporate official Tailwind plugins such as @tailwindcss/typography, @tailwindcss/forms, and @tailwindcss/container-queries to accelerate consistent styling.
Storybook Integration: Set up Storybook for visual regression testing of every atom and molecule component, including light and dark themes.
QUICK “NEW PAGE” CHECKLIST
Before deploying a new page, run through this checklist:
□ Wrap page sections with .container and py-16 for consistent spacing.
□ Use the appropriate heading scale (e.g., h2 corresponds to text-3xl).
□ Choose the correct surface styling: bg-white dark:bg-surfaceDark shadow-md rounded-xl.
□ Apply motion and animations using shared variants.
□ Adhere to color tokens; never hard-code hex values outside the token store.
□ Verify mobile-first responsiveness (sm: overrides are correctly applied).
□ Test thoroughly in light/dark modes, keyboard navigation, and check Lighthouse scores.
With this system in hand, you can scaffold any new page and trust that the look-and-feel, interactions, and accessibility will remain perfectly consistent across your portfolio. Happy building!
