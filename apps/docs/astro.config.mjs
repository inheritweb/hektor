import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Hektor',
      favicon: '/favicon.svg',
      logo: {
        src: './public/favicon.svg',
        alt: '',
      },
      head: [
        {
          tag: 'link',
          attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        },
        {
          tag: 'link',
          attrs: { rel: 'manifest', href: '/manifest.webmanifest' },
        },
        {
          tag: 'meta',
          attrs: { name: 'theme-color', content: '#59dc91' },
        },
      ],
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
