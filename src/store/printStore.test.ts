/**
 * Unit tests for usePrintStore.
 * Covers job tracking, status updates (existing and unknown jobs),
 * queue enqueue/dequeue/dedupe, clear, and the submitting flag.
 */

import { renderHook, act } from "@testing-library/react";
import usePrintStore from "./printStore";
import { PrintStatus } from "../types/sign.types";

const job = {
  jobId: "job-1",
  signIds: ["s1", "s2"],
  status: PrintStatus.QUEUED,
  message: "queued",
  createdAt: "2026-06-19",
};

describe("usePrintStore", () => {
  it("starts with empty jobs and queue", () => {
    const { result } = renderHook(() => usePrintStore());
    expect(result.current.jobs).toEqual({});
    expect(result.current.queue).toEqual([]);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("adds a job keyed by jobId", () => {
    const { result } = renderHook(() => usePrintStore());
    act(() => result.current.addJob(job));
    expect(result.current.jobs["job-1"]).toEqual(job);
  });

  it("updates the status of an existing job", () => {
    const { result } = renderHook(() => usePrintStore());
    act(() => result.current.addJob(job));
    act(() => result.current.updateJobStatus("job-1", PrintStatus.COMPLETED, "done"));
    expect(result.current.jobs["job-1"].status).toBe(PrintStatus.COMPLETED);
    expect(result.current.jobs["job-1"].message).toBe("done");
  });

  it("keeps the previous message when none is provided", () => {
    const { result } = renderHook(() => usePrintStore());
    act(() => result.current.addJob(job));
    act(() => result.current.updateJobStatus("job-1", PrintStatus.PRINTING));
    expect(result.current.jobs["job-1"].message).toBe("queued");
  });

  it("ignores status updates for unknown jobs", () => {
    const { result } = renderHook(() => usePrintStore());
    act(() => result.current.updateJobStatus("missing", PrintStatus.FAILED));
    expect(result.current.jobs).toEqual({});
  });

  it("enqueues without duplicates and dequeues", () => {
    const { result } = renderHook(() => usePrintStore());
    act(() => result.current.enqueue("s1"));
    act(() => result.current.enqueue("s1"));
    act(() => result.current.enqueue("s2"));
    expect(result.current.queue).toEqual(["s1", "s2"]);
    act(() => result.current.dequeue("s1"));
    expect(result.current.queue).toEqual(["s2"]);
  });

  it("clears the queue", () => {
    const { result } = renderHook(() => usePrintStore());
    act(() => result.current.enqueue("s1"));
    act(() => result.current.clearQueue());
    expect(result.current.queue).toEqual([]);
  });

  it("sets the submitting flag", () => {
    const { result } = renderHook(() => usePrintStore());
    act(() => result.current.setSubmitting(true));
    expect(result.current.isSubmitting).toBe(true);
  });
});
