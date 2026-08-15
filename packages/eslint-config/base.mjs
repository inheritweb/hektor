import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

import { topLevelSpacingConfig } from './top-level-spacing.mjs';

export const baseConfig = tseslint.config(
  {
    ignores: ['.next/**', '.turbo/**', 'dist/**', 'node_modules/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  topLevelSpacingConfig,
  prettier,
);

export default baseConfig;
