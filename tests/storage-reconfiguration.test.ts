import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  beginStorageReconfigurationBackup,
  cleanupStorageReconfigurationBackup,
  recoverInterruptedStorageReconfiguration,
  restoreStorageReconfigurationBackup
} from "../src/main/storage-reconfiguration";

describe("storage reconfiguration backup", () => {
  it("restores mutable data after a failed encryption switch", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "suiji-storage-"));
    try {
      await mkdir(path.join(root, "notes", "old"), { recursive: true });
      await mkdir(path.join(root, "backups"), { recursive: true });
      await writeFile(path.join(root, "suiji.db"), "old-db");
      await writeFile(path.join(root, "settings.json"), "old-settings");
      await writeFile(path.join(root, "notes", "old", "note.json"), "old-note");

      const backup = await beginStorageReconfigurationBackup(root);
      await writeFile(path.join(root, "suiji.db"), "new-db");
      await writeFile(path.join(root, "settings.json"), "new-settings");
      await rm(path.join(root, "notes", "old", "note.json"), { force: true });
      await writeFile(path.join(root, "notes", "new.json"), "new-note");

      await restoreStorageReconfigurationBackup(backup);
      await cleanupStorageReconfigurationBackup(backup);

      expect(await readFile(path.join(root, "suiji.db"), "utf8")).toBe("old-db");
      expect(await readFile(path.join(root, "settings.json"), "utf8")).toBe("old-settings");
      expect(await readFile(path.join(root, "notes", "old", "note.json"), "utf8")).toBe("old-note");
      await expect(readFile(path.join(root, "notes", "new.json"), "utf8")).rejects.toThrow();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("recovers an interrupted switch from the marker on next startup", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "suiji-storage-"));
    try {
      await writeFile(path.join(root, "settings.json"), "old-settings");
      await beginStorageReconfigurationBackup(root);
      await writeFile(path.join(root, "settings.json"), "new-settings");

      await recoverInterruptedStorageReconfiguration(root);
      expect(await readFile(path.join(root, "settings.json"), "utf8")).toBe("old-settings");
      await expect(recoverInterruptedStorageReconfiguration(root)).resolves.toBeUndefined();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
