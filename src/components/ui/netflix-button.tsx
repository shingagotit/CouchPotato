import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground hover:bg-muted shadow-card",
        primary: "gradient-primary text-primary-foreground hover:shadow-purple",
        hero: "bg-primary text-primary-foreground hover:bg-primary-light shadow-glow hover:shadow-purple transition-bounce",
        play: "bg-foreground text-background hover:bg-muted-foreground flex items-center gap-2 font-semibold",
        info: "bg-muted/60 text-foreground hover:bg-muted backdrop-blur-strong border border-border",
        ghost: "text-foreground hover:bg-muted/50",
        outline: "border border-border bg-transparent hover:bg-muted text-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const NetflixButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
NetflixButton.displayName = "NetflixButton";

export { NetflixButton, buttonVariants };