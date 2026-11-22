import { constants as fsConstants } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

export const STORAGE_RECONFIGURATION_ENTRIES = ["suiji.db", "notes", "backups", "settings.json"] as const;

export type StorageReconfigurationBackup = {
  dataRoot: string;
  backupDir: string;
  markerPath: string;
};

function paths(dataRoot: string) {
  const backupDir = path.join(dataRoot, ".suiji-reconfigure-backup");
  return { backupDir, markerPath: `${backupDir}.json` };
}

async function exists(filePath: string) {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyEntry(source: string, target: string) {
  try {
    const stat = await fs.stat(source);
    if (stat.isDirectory()) {
      await fs.cp(source, target, { recursive: true, force: false, errorOnExist: false });
      return;
    }
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(source, target, fsConstants.COPYFILE_EXCL);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

export async function beginStorageReconfigurationBackup(dataRoot: string): Promise<StorageReconfigurationBackup> {
  const { backupDir, markerPath } = paths(dataRoot);
  await fs.rm(backupDir, { recursive: true, force: true }).catch(() => undefined);
  await fs.rm(markerPath, { force: true }).catch(() => undefined);
  await fs.mkdir(backupDir, { recursive: true });
  for (const entry of STORAGE_RECONFIGURATION_ENTRIES) {
    await copyEntry(path.join(dataRoot, entry), path.join(backupDir, entry));
  }
  await fs.writeFile(markerPath, JSON.stringify({ app: "suiji", version: 1 }));
  return { dataRoot, backupDir, markerPath };
}

export async function restoreStorageReconfigurationBackup(backup: StorageReconfigurationBackup) {
  for (const entry of STORAGE_RECONFIGURATION_ENTRIES) {
    const target = path.join(backup.dataRoot, entry);
    await fs.rm(target, { recursive: true, force: true });
    await copyEntry(path.join(backup.backupDir, entry), target);
  }
  await fs.rm(backup.markerPath, { force: true });
}

export async function cleanupStorageReconfigurationBackup(backup: StorageReconfigurationBackup) {
  await fs.rm(backup.markerPath, { force: true });
  await fs.rm(backup.backupDir, { recursive: true, force: true });
}

export async function recoverInterruptedStorageReconfiguration(dataRoot: string) {
  const { backupDir, markerPath } = paths(dataRoot);
  if (!(await exists(markerPath))) return;
  await restoreStorageReconfigurationBackup({ dataRoot, backupDir, markerPath });
  await cleanupStorageReconfigurationBackup({ dataRoot, backupDir, markerPath });
}
