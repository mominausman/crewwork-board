import { toast } from "sonner";

/**
 * Centralized error handler that:
 * - Only logs detailed errors in development mode
 * - Shows user-friendly messages in production
 * - Prevents sensitive information leakage via console
 */
export function handleError(error: any, userMessage: string, context?: string) {
  // Only log detailed errors in development
  if (import.meta.env.DEV) {
    console.error(context ? `[${context}]` : "", error);
  }
  
  // Show user-friendly message
  toast.error(userMessage);
}

/**
 * Handle errors without showing toast notification
 * Useful for silent error handling where UI feedback is handled elsewhere
 */
export function handleErrorSilent(error: any, context?: string) {
  if (import.meta.env.DEV) {
    console.error(context ? `[${context}]` : "", error);
  }
}
