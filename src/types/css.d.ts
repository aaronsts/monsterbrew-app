// Ambient declaration for global CSS side-effect imports (e.g. `import "./globals.css"`).
// Next.js resolves these at the bundler level, but some TypeScript versions/editors
// emit TS2882 without an explicit module declaration.
declare module "*.css";
