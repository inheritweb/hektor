import type { Preview } from '@storybook/react-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import { createElement } from 'react';

import { TooltipProvider } from '../src/atoms/Tooltip';
import { ThemeProvider } from '../src/context';

import './storybook.css';

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(ThemeProvider, {
        storageKey: 'hektor-storybook-theme',
        children: createElement(TooltipProvider, null, createElement(Story)),
      }),
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
  parameters: {
    a11y: {
      test: 'todo',
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    options: {
      storySort: {
        order: ['Atoms', 'Molecules', 'Organisms', 'Templates', 'Pages'],
      },
    },
  },
};

export default preview;
