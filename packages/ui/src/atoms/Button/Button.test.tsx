import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Button } from './Button.component';

afterEach(cleanup);

describe('Button', () => {
  it('renders a native button with its label', () => {
    render(<Button>Save changes</Button>);

    const button = screen.getByRole('button', { name: 'Save changes' });

    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('data-slot')).toBe('button');
  });

  it('calls its click handler', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Save changes</Button>);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call its click handler when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button disabled onClick={onClick}>
        Save changes
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save changes' });
    await user.click(button);

    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });
});
