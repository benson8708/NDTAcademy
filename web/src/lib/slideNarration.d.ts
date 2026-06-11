import type { Step } from "@/lib/lessonSteps";

export function stripMd(s: string): string;
export function djb2(s: string): string;
export function narrationText(step: Step): string | null;
export function narrationKey(step: Step): string | null;
