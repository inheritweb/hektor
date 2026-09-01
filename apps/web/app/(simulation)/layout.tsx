import type { ReactNode } from 'react';

import { SimulationToolsStateProvider } from '@hektor/ui/context';

export default function SimulationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SimulationToolsStateProvider>{children}</SimulationToolsStateProvider>
  );
}
