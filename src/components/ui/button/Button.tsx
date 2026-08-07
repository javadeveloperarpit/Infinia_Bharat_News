"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-md",

        secondary:
          "bg-[var(--accent)] text-[var(--primary)] hover:opacity-90 shadow",

        outline:
          "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white",

        ghost:
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",

        danger:
          "bg-red-600 text-white hover:bg-red-700",

        link:
          "underline underline-offset-4 hover:text-[var(--primary)]",
      },

      size: {
        sm: "h-9 px-4 text-sm",

        md: "h-11 px-6 text-base",

        lg: "h-12 px-8 text-lg",

        icon: "h-10 w-10 p-0",
      },

      fullWidth: {
        true: "w-full",

        false: "",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  size,
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({
          variant,
          size,
          fullWidth,
        }),
        className
      )}
      {...props}
    />
  );
}

export default Button;