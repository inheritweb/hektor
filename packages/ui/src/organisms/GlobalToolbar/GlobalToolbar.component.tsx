import type { ReactNode } from 'react';
import { LuChevronRight, LuHouse } from 'react-icons/lu';

export interface GlobalToolbarBreadcrumb {
  href?: string;
  label: string;
}

export interface GlobalToolbarProps {
  breadcrumbs: readonly GlobalToolbarBreadcrumb[];
  tools?: ReactNode;
}

export function GlobalToolbar({ breadcrumbs, tools }: GlobalToolbarProps) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 border-b border-border/40 px-3 py-2 md:px-4">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm">
          {breadcrumbs.map((breadcrumb, index) => {
            const current = index === breadcrumbs.length - 1;
            return (
              <li
                className="flex items-center gap-1.5"
                key={`${breadcrumb.label}-${index}`}
              >
                {index > 0 ? (
                  <LuChevronRight
                    aria-hidden="true"
                    className="size-3.5 text-muted-foreground/40"
                  />
                ) : null}
                {breadcrumb.href && !current ? (
                  <a
                    aria-label={index === 0 ? breadcrumb.label : undefined}
                    className="text-muted-foreground/80 transition-colors hover:text-foreground"
                    href={breadcrumb.href}
                  >
                    {index === 0 ? (
                      <LuHouse aria-hidden="true" className="size-3.5" />
                    ) : (
                      breadcrumb.label
                    )}
                  </a>
                ) : (
                  <span
                    aria-label={index === 0 ? breadcrumb.label : undefined}
                    aria-current={current ? 'page' : undefined}
                    className={
                      current
                        ? 'font-medium text-foreground/80'
                        : 'text-muted-foreground/80'
                    }
                  >
                    {index === 0 ? (
                      <LuHouse aria-hidden="true" className="size-3.5" />
                    ) : (
                      breadcrumb.label
                    )}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {tools ? <div className="shrink-0">{tools}</div> : null}
    </div>
  );
}
