// Declare uppercase image extensions that Next.js's built-in types don't cover.
// Next.js image types cover .png/.jpg etc. (lowercase) via next/image-types/global,
// but not uppercase variants like .PNG.
declare module '*.PNG' {
  const src: string;
  export default src;
}
