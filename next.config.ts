import type { NextConfig } from 'next';

// The preview proxy has a different host from the dev server. Allow only the
// explicitly configured preview hostname, not every sandbox's origin.
const config: NextConfig = {
  allowedDevOrigins: process.env.PREVIEW_HOST ? [process.env.PREVIEW_HOST] : [],
};
export default config;
