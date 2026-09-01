import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { SimulationToolsStateProvider } from '../../context';
import { SimulationTemplate } from './SimulationTemplate.component';

afterEach(cleanup);

describe('SimulationTemplate', () => {
  it('preserves the open tools panel when a simulation screen is replaced', async () => {
    const user = userEvent.setup();
    const renderTemplate = (key: string) => (
      <SimulationTemplate
        key={key}
        header={<div>Header</div>}
        tools={<div>Tools</div>}
      >
        <div>Record</div>
      </SimulationTemplate>
    );
    const { rerender } = render(
      <SimulationToolsStateProvider>
        {renderTemplate('first-patient')}
      </SimulationToolsStateProvider>,
    );

    await user.click(
      screen.getByRole('button', { name: 'Open simulation tools' }),
    );
    expect(
      screen.getByRole('button', { name: 'Close simulation tools' }),
    ).toBeTruthy();

    rerender(
      <SimulationToolsStateProvider>
        {renderTemplate('next-patient')}
      </SimulationToolsStateProvider>,
    );

    expect(
      screen.getByRole('button', { name: 'Close simulation tools' }),
    ).toBeTruthy();
  });
});
