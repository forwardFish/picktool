import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";;
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1.1rem] text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-[linear-gradient(90deg,var(--pn-indigo),var(--pn-violet),var(--pn-fuchsia))] text-white shadow-[0_18px_48px_rgba(124,58,237,0.24)] hover:brightness-[1.03]",
        destructive:
          "border border-transparent bg-destructive text-white shadow-[0_16px_36px_rgba(239,68,68,0.18)] hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border border-[var(--pn-border)] bg-white/88 text-[var(--pn-text)] shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur hover:bg-[var(--pn-soft)]",
        secondary:
          "border border-[var(--pn-soft-border)] bg-[var(--pn-soft)] text-[var(--pn-violet)] shadow-[0_10px_24px_rgba(124,58,237,0.08)] hover:bg-[var(--pn-soft-2)]",
        ghost:
          "text-[var(--pn-muted-2)] hover:bg-white/70 hover:text-[var(--pn-text)]",
        link: "text-[var(--pn-indigo)] underline-offset-4 hover:underline"
      },
      size: {
        default: "h-11 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 rounded-[1rem] gap-1.5 px-3.5 has-[>svg]:px-3",
        lg: "h-12 rounded-[1.25rem] px-7 text-base has-[>svg]:px-5",
        icon: "size-11 rounded-[1rem]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
