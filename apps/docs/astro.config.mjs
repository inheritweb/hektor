import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Hektor Docs',
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com' }],
      customCss: ['./src/styles/global.css'],
      sidebar: [
        {
          label: 'Overview',
          items: [{ label: 'Introduction', slug: 'overview' }],
        },
        {
          label: 'Org Admins',
          items: [{ autogenerate: { directory: 'org-admins' } }],
        },
        {
          label: 'Tutors',
          items: [{ autogenerate: { directory: 'tutors' } }],
        },
        {
          label: 'Org Learners',
          items: [{ autogenerate: { directory: 'org-learners' } }],
        },
        {
          label: 'Individual Learners',
          items: [{ autogenerate: { directory: 'individual-learners' } }],
        },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
