"use client";
import { reachGoal } from "./goals";

export function TrackedLink({ goal, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { goal: "phone_click" | "messenger_click" }) {
  return <a {...props} onClick={(e) => { reachGoal(goal); props.onClick?.(e); }} />;
}
