import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

export const nextConfig = [
  {
    ignores: ['.next/**', '.turbo/**', 'dist/**', 'node_modules/**'],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  prettier,
];

export default nextConfig;
