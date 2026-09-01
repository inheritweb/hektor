import { LuArrowLeft, LuArrowRight, LuDoorOpen } from 'react-icons/lu';

import {
  buttonVariants,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../atoms';
import { NavigationLink } from '../../context';

export interface SimulationToolsProps {
  exitHref: string;
  nextPreview?: SimulationPreviewNavigationItem;
  previousPreview?: SimulationPreviewNavigationItem;
  previewLabel?: string;
}

export interface SimulationPreviewNavigationItem {
  href: string;
  label: string;
}

export function SimulationTools({
  exitHref,
  nextPreview,
  previousPreview,
  previewLabel = 'Preview mode',
}: SimulationToolsProps) {
  return (
    <div className="pr-8">
      <h2 className="text-base font-semibold">Simulation tools</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {previewLabel}. These controls sit outside the simulated EHR.
      </p>
      {previousPreview || nextPreview ? (
        <div className="mt-6 border-t border-border pt-5">
          <h3 className="text-sm font-semibold">Browse patient EHRs</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Open the current base-profile preview for an adjacent patient.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {previousPreview ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <NavigationLink
                      aria-label={`Previous EHR: ${previousPreview.label}`}
                      className={`${buttonVariants({ variant: 'outline' })} w-full justify-start`}
                      href={previousPreview.href}
                    />
                  }
                >
                  <LuArrowLeft aria-hidden="true" />
                  Previous
                </TooltipTrigger>
                <TooltipContent side="top">
                  {previousPreview.label}
                </TooltipContent>
              </Tooltip>
            ) : null}
            {nextPreview ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <NavigationLink
                      aria-label={`Next EHR: ${nextPreview.label}`}
                      className={`${buttonVariants({ variant: 'outline' })} w-full justify-end ${previousPreview ? '' : 'col-start-2'}`}
                      href={nextPreview.href}
                    />
                  }
                >
                  Next
                  <LuArrowRight aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent side="top">{nextPreview.label}</TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        </div>
      ) : null}
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
