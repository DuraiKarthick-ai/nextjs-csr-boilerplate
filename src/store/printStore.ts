/**
 * Print state hook using useState.
 * Tracks queued items, active print jobs, and per-job status updates.
 * Use usePrintStore inside any component that needs print state.
 */

import { useState, useCallback } from "react";
import { PrintStatus } from "../types/sign.types";

/**
 * Represents an individual tracked print job.
 */
interface PrintJob {
  jobId: string;
  signIds: string[];
  status: PrintStatus;
  message: string;
  createdAt: string;
}

/**
 * Shape of the print store.
 */
interface PrintState {
  /** Active and recent print jobs keyed by jobId. */
  jobs: Record<string, PrintJob>;
  /** IDs of signs currently queued but not yet submitted as a job. */
  queue: string[];
  /** Whether a print submission is in flight. */
  isSubmitting: boolean;

  /**
   * Adds a completed/queued print job record to the store.
   *
   * @param {PrintJob} job - The print job to track.
   */
  addJob: (job: PrintJob) => void;

  /**
   * Updates the status of an existing tracked job.
   *
   * @param {string} jobId - The job identifier to update.
   * @param {PrintStatus} status - The new status value.
   * @param {string} [message] - Optional status message.
   */
  updateJobStatus: (jobId: string, status: PrintStatus, message?: string) => void;

  /**
   * Adds a sign ID to the local print queue.
   *
   * @param {string} signId - The sign ID to enqueue.
   */
  enqueue: (signId: string) => void;

  /**
   * Removes a sign ID from the local print queue.
   *
   * @param {string} signId - The sign ID to remove.
   */
  dequeue: (signId: string) => void;

  /** Clears all items from the local print queue. */
  clearQueue: () => void;

  /**
   * Sets the submitting flag.
   *
   * @param {boolean} isSubmitting - Whether a submission is in progress.
   */
  setSubmitting: (isSubmitting: boolean) => void;
}

/**
 * Shape returned by usePrintStore.
 */
export interface UsePrintStoreResult {
  jobs: Record<string, PrintJob>;
  queue: string[];
  isSubmitting: boolean;
  addJob: (job: PrintJob) => void;
  updateJobStatus: (jobId: string, status: PrintStatus, message?: string) => void;
  enqueue: (signId: string) => void;
  dequeue: (signId: string) => void;
  clearQueue: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
}

/**
 * usePrintStore — standalone useState-based hook for print job state.
 * Each component instance gets its own state. For cross-component sharing,
 * lift the hook to a common ancestor or wrap in a Context.
 *
 * @returns {UsePrintStoreResult} Print state and actions.
 */
function usePrintStore(): UsePrintStoreResult {
  const [jobs, setJobs] = useState<Record<string, PrintJob>>({});
  const [queue, setQueue] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Adds a completed/queued print job record.
   *
   * @param {PrintJob} job - The print job to track.
   */
  const addJob = useCallback((job: PrintJob): void => {
    setJobs((prev) => ({ ...prev, [job.jobId]: job }));
  }, []);

  /**
   * Updates the status of an existing tracked job.
   *
   * @param {string} jobId - The job identifier to update.
   * @param {PrintStatus} status - The new status value.
   * @param {string} [message] - Optional status message.
   */
  const updateJobStatus = useCallback(
    (jobId: string, status: PrintStatus, message?: string): void => {
      setJobs((prev) => {
        const existing = prev[jobId];
        if (!existing) return prev;
        return {
          ...prev,
          [jobId]: { ...existing, status, message: message ?? existing.message },
        };
      });
    },
    []
  );

  /**
   * Adds a sign ID to the local print queue.
   *
   * @param {string} signId - The sign ID to enqueue.
   */
  const enqueue = useCallback((signId: string): void => {
    setQueue((prev) =>
      prev.includes(signId) ? prev : [...prev, signId]
    );
  }, []);

  /**
   * Removes a sign ID from the local print queue.
   *
   * @param {string} signId - The sign ID to remove.
   */
  const dequeue = useCallback((signId: string): void => {
    setQueue((prev) => prev.filter((id) => id !== signId));
  }, []);

  /** Clears all items from the local print queue. */
  const clearQueue = useCallback((): void => {
    setQueue([]);
  }, []);

  /**
   * Sets the submitting flag.
   *
   * @param {boolean} submitting - Whether a submission is in progress.
   */
  const setSubmitting = useCallback((submitting: boolean): void => {
    setIsSubmitting(submitting);
  }, []);

  return {
    jobs,
    queue,
    isSubmitting,
    addJob,
    updateJobStatus,
    enqueue,
    dequeue,
    clearQueue,
    setSubmitting,
  };
}

export default usePrintStore;
