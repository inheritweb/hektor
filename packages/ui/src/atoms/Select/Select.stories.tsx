import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select.component';

const options = [
  { value: 'personal', label: 'Personal account' },
  { value: 'northshire', label: 'Northshire University' },
  { value: 'westborough', label: 'Westborough University' },
];

const meta = {
  title: 'Atoms/Select',
  component: SelectTrigger,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SelectTrigger>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('personal');

    return (
      <div className="w-72">
        <Select
          items={options}
          onValueChange={(nextValue) => nextValue && setValue(nextValue)}
          value={value}
        >
          <SelectTrigger aria-label="Account or organisation">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  },
};
