import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNow } from "./useNow";

describe("useNow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-20T16:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("devuelve la hora actual al montar", () => {
    const { result } = renderHook(() => useNow());
    expect(result.current.toISOString()).toBe("2026-10-20T16:00:00.000Z");
  });

  it("se actualiza cada minuto", () => {
    const { result } = renderHook(() => useNow());
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.toISOString()).toBe("2026-10-20T16:01:00.000Z");
  });

  it("deja de actualizar al desmontar", () => {
    const { unmount } = renderHook(() => useNow());
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
