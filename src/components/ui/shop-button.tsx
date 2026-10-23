import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-primary-foreground glow hover:brightness-110",
  outline: "border-2 border-primary/70 bg-transparent text-foreground hover:bg-primary/10",
  success: "bg-success text-success-foreground hover:brightness-110",
  bare: "bg-transparent text-foreground",
};

export function ShopButton({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button {...p} className={cn("flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold transition active:scale-[0.98] disabled:opacity-50", variants[variant], className)} />
  );
}
