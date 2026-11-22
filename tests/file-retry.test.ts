import { describe, expect, it, vi } from "vitest";
import { renameWithBusyRetry } from "../src/main/file-retry";

function busyError() {
  const error = new Error("resource busy") as NodeJS.ErrnoException;
  error.code = "EBUSY";
  return error;
}

describe("renameWithBusyRetry", () => {
  it("retries transient Windows file locks", async () => {
    const sleep = vi.fn(async () => undefined);
    let attempts = 0;
    await renameWithBusyRetry(
      async () => {
        attempts += 1;
        if (attempts < 3) throw busyError();
        return "saved";
      },
      sleep
    );
    expect(attempts).toBe(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it("does not retry unrelated write errors", async () => {
    const sleep = vi.fn(async () => undefined);
    await expect(
      renameWithBusyRetry(
        async () => {
          const error = new Error("denied") as NodeJS.ErrnoException;
          error.code = "EACCES";
          throw error;
        },
        sleep
      )
    ).rejects.toThrow("denied");
    expect(sleep).not.toHaveBeenCalled();
  });
});
