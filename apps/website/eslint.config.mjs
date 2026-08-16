import baseConfig from '@hektor/eslint-config';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', '.astro/**'],
  },
];
