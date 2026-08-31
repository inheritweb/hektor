import { LuDoorOpen } from 'react-icons/lu';

import { buttonVariants } from '../../atoms';
import { NavigationLink } from '../../context';

export interface SimulationToolsProps {
  exitHref: string;
  previewLabel?: string;
}

export function SimulationTools({
  exitHref,
  previewLabel = 'Preview mode',
}: SimulationToolsProps) {
  return (
    <div className="pr-8">
      <h2 className="text-base font-semibold">Simulation tools</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {previewLabel}. These controls sit outside the simulated EHR.
      </p>
      <div className="mt-8 border-t border-border pt-5">
        <NavigationLink
          className={`${buttonVariants({ variant: 'outline' })} w-full justify-start`}
          href={exitHref}
        >
          <LuDoorOpen aria-hidden="true" />
          Leave preview
        </NavigationLink>
      </div>
    </div>
  );
}
