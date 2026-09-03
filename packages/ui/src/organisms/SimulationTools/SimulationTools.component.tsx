import { LuArrowLeft, LuArrowRight, LuCheck, LuDoorOpen } from 'react-icons/lu';

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
  scenario?: {
    title: string;
    status: string;
    currentStepTitle: string;
    currentStepId: string;
    steps: readonly {
      id: string;
      kind: string;
      title: string;
    }[];
  };
  onScenarioStepChange?: (stepId: string) => void;
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
  scenario,
  onScenarioStepChange,
}: SimulationToolsProps) {
  return (
    <div className="pr-8">
      <h2 className="text-base font-semibold">Simulation tools</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {previewLabel}. These controls sit outside the simulated EHR.
      </p>
      {scenario ? (
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Scenario · {scenario.status.replaceAll('_', ' ')}
          </p>
          <h3 className="mt-2 text-sm font-semibold">{scenario.title}</h3>
          <p className="mt-3 text-xs font-semibold text-muted-foreground">
            {scenario.steps.findIndex(
              ({ id }) => id === scenario.currentStepId,
            ) === 0
              ? 'Beginning'
              : `Step ${scenario.steps.findIndex(({ id }) => id === scenario.currentStepId) + 1}`}
          </p>
          <p className="mt-1 text-sm">{scenario.currentStepTitle}</p>
          <ol aria-label="Scenario timeline" className="mt-4 space-y-2">
            {scenario.steps.map((step, index) => {
              const selected = step.id === scenario.currentStepId;
              const stepLabel =
                step.kind === 'beginning' ? 'Beginning' : `Step ${index + 1}`;
              return (
                <li key={step.id}>
                  <button
                    aria-current={selected ? 'step' : undefined}
                    aria-label={`${stepLabel}: ${step.title}`}
                    className={`flex w-full cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 ${
                      selected
                        ? 'border-primary bg-accent/40'
                        : 'border-border hover:bg-accent/30'
                    }`}
                    disabled={selected}
                    onClick={() => onScenarioStepChange?.(step.id)}
                    type="button"
                  >
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                      {selected ? (
                        <LuCheck aria-hidden="true" className="size-4" />
                      ) : (
                        <span aria-hidden="true">{index + 1}</span>
                      )}
                    </span>
                    <span>
                      <span className="block text-xs font-semibold text-muted-foreground">
                        {stepLabel}
                      </span>
                      <span className="mt-0.5 block">{step.title}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
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
