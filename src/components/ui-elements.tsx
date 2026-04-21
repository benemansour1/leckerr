import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg' | 'icon', isLoading?: boolean }
>(({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
  const variants = {
    primary: "bg-gradient-to-r from-primary to-amber-500 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border-2 border-primary text-primary hover:bg-primary/10",
    ghost: "text-foreground hover:bg-secondary/50",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-6 py-3 font-semibold rounded-xl",
    lg: "px-8 py-4 text-lg font-bold rounded-2xl",
    icon: "p-3 rounded-xl"
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "relative flex items-center justify-center transition-all duration-300 ease-out overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 me-2 animate-spin" />}
      {children}
    </button>
  );
});
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-muted-foreground ms-1">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "w-full bg-input/50 border-2 border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 transition-all duration-200",
            "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-input",
            error && "border-destructive focus:border-destructive focus:ring-destructive/10",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-destructive ms-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-card border border-border/50 rounded-2xl shadow-xl shadow-black/20 overflow-hidden", className)} {...props}>
    {children}
  </div>
);

export const Dialog = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-6 pointer-events-auto max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gold-gradient mb-6">{title}</h2>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
