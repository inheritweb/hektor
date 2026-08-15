import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

import { topLevelSpacingConfig } from './top-level-spacing.mjs';

export const nextConfig = [
  {
    ignores: ['.next/**', '.turbo/**', 'dist/**', 'node_modules/**'],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  topLevelSpacingConfig,
  prettier,
];

export default nextConfig;
