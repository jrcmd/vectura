declare module 'node-cron' {
  export function schedule(expression: string, func: () => void | Promise<void>): { destroy: () => void };
  export const scheduledJobs: Record<string, unknown>;
}