import db from "./schema";
import { generateId } from "@/lib/utils";

const MAX_VERSIONS = 20;

export interface ProfileVersion {
  id: string;
  profileId: string;
  version: number;
  snapshotJson: string;
  createdAt: string;
}

export interface ProfileVersionSummary {
  id: string;
  version: number;
  createdAt: string;
}

/**
 * Save a profile snapshot into profile_versions.
 * Auto-prunes to keep only the last MAX_VERSIONS entries.
 */
export function createProfileSnapshot(userId: string, snapshotJson: string): ProfileVersion {
  const lastVersion = db
    .prepare("SELECT MAX(version) as max_version FROM profile_versions WHERE profile_id = ?")
    .get(userId) as { max_version: number | null } | undefined;

  const nextVersion = (lastVersion?.max_version ?? 0) + 1;
  const id = generateId();

  db.prepare(`
    INSERT INTO profile_versions (id, profile_id, version, snapshot_json, created_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(id, userId, nextVersion, snapshotJson);

  pruneVersions(userId);

  return {
    id,
    profileId: userId,
    version: nextVersion,
    snapshotJson,
    createdAt: new Date().toISOString(),
  };
}

/**
 * List all profile versions (most recent first).
 */
export function listProfileVersions(userId: string = "default"): ProfileVersionSummary[] {
  const rows = db
    .prepare("SELECT id, version, created_at FROM profile_versions WHERE profile_id = ? ORDER BY version DESC")
    .all(userId) as Array<{ id: string; version: number; created_at: string }>;

  return rows.map((row) => ({
    id: row.id,
    version: row.version,
    createdAt: row.created_at,
  }));
}

/**
 * Get a specific version by ID.
 */
export function getProfileVersion(
  versionId: string,
  userId: string = "default"
): ProfileVersion | null {
  const row = db
    .prepare("SELECT * FROM profile_versions WHERE id = ? AND profile_id = ?")
    .get(versionId, userId) as { id: string; profile_id: string; version: number; snapshot_json: string; created_at: string } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    profileId: row.profile_id,
    version: row.version,
    snapshotJson: row.snapshot_json,
    createdAt: row.created_at,
  };
}

/**
 * Remove oldest versions beyond MAX_VERSIONS limit.
 */
export function pruneVersions(userId: string = "default"): number {
  const countRow = db
    .prepare("SELECT COUNT(*) as count FROM profile_versions WHERE profile_id = ?")
    .get(userId) as { count: number };

  if (countRow.count <= MAX_VERSIONS) return 0;

  const excess = countRow.count - MAX_VERSIONS;

  const result = db.prepare(`
    DELETE FROM profile_versions WHERE id IN (
      SELECT id FROM profile_versions
      WHERE profile_id = ?
      ORDER BY version ASC
      LIMIT ?
    )
  `).run(userId, excess);

  return result.changes;
}
