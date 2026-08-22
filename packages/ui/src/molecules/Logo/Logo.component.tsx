import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '#lib/utils';

const logoVariants = cva('inline-flex items-center text-title', {
  variants: {
    size: {
      sm: 'gap-2 text-lg',
      md: 'gap-2.5 text-2xl',
      lg: 'gap-3 text-3xl',
      xl: 'gap-3.5 text-4xl',
    },
  },
  defaultVariants: { size: 'md' },
});

const markVariants = cva('hektor-logo-mark shrink-0 text-primary', {
  variants: {
    size: {
      sm: 'h-6 w-[1.44rem]',
      md: 'h-8 w-[1.92rem]',
      lg: 'h-10 w-9',
      xl: 'h-12 w-[2.88rem]',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface LogoProps extends VariantProps<typeof logoVariants> {
  className?: string;
  label?: string;
  variant?: 'mark' | 'lockup';
}

export function Logo({
  className,
  label = 'Hektor',
  size = 'md',
  variant = 'lockup',
}: LogoProps) {
  return (
    <span
      aria-label={label}
      className={cn(logoVariants({ size }), className)}
      role="img"
    >
      <span aria-hidden="true" className={cn(markVariants({ size }))} />
      {variant === 'lockup' ? (
        <span className="font-title font-black tracking-[-0.045em]">
          {label}
        </span>
      ) : null}
    </span>
  );
}
