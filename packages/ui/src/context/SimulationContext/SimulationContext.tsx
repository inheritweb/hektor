'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

interface SimulationToolsState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SimulationToolsContext = createContext<SimulationToolsState | undefined>(
  undefined,
);

export function SimulationToolsStateProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <SimulationToolsContext.Provider value={value}>
      {children}
    </SimulationToolsContext.Provider>
  );
}

export function useSimulationToolsState() {
  return useContext(SimulationToolsContext);
}
