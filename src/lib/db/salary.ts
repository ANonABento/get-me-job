import db from "./schema";
import { generateId } from "@/lib/utils";

export interface SalaryOffer {
  id: string;
  userId: string;
  jobId?: string;
  company: string;
  role: string;
  baseSalary: number;
  signingBonus?: number;
  annualBonus?: number;
  equityValue?: number;
  vestingYears?: number;
  location?: string;
  status: "pending" | "accepted" | "declined" | "negotiating" | "expired";
  notes?: string;
  negotiationOutcome?: string;
  finalBaseSalary?: number;
  finalTotalComp?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalaryOfferInput {
  jobId?: string;
  company: string;
  role: string;
  baseSalary: number;
  signingBonus?: number;
  annualBonus?: number;
  equityValue?: number;
  vestingYears?: number;
  location?: string;
  notes?: string;
}

export interface UpdateSalaryOfferInput {
  baseSalary?: number;
  signingBonus?: number;
  annualBonus?: number;
  equityValue?: number;
  vestingYears?: number;
  location?: string;
  status?: SalaryOffer["status"];
  notes?: string;
  negotiationOutcome?: string;
  finalBaseSalary?: number;
  finalTotalComp?: number;
}

// Get all salary offers for a user
export function getSalaryOffers(userId: string = "default"): SalaryOffer[] {
  const stmt = db.prepare(`
    SELECT id, user_id, job_id, company, role, base_salary, signing_bonus,
           annual_bonus, equity_value, vesting_years, location, status, notes,
           negotiation_outcome, final_base_salary, final_total_comp, created_at, updated_at
    FROM salary_offers
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);

  const rows = stmt.all(userId) as Array<{
    id: string;
    user_id: string;
    job_id: string | null;
    company: string;
    role: string;
    base_salary: number;
    signing_bonus: number | null;
    annual_bonus: number | null;
    equity_value: number | null;
    vesting_years: number | null;
    location: string | null;
    status: string;
    notes: string | null;
    negotiation_outcome: string | null;
    final_base_salary: number | null;
    final_total_comp: number | null;
    created_at: string;
    updated_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    jobId: row.job_id || undefined,
    company: row.company,
    role: row.role,
    baseSalary: row.base_salary,
    signingBonus: row.signing_bonus || undefined,
    annualBonus: row.annual_bonus || undefined,
    equityValue: row.equity_value || undefined,
    vestingYears: row.vesting_years || undefined,
    location: row.location || undefined,
    status: row.status as SalaryOffer["status"],
    notes: row.notes || undefined,
    negotiationOutcome: row.negotiation_outcome || undefined,
    finalBaseSalary: row.final_base_salary || undefined,
    finalTotalComp: row.final_total_comp || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// Get a single salary offer
export function getSalaryOffer(id: string, userId: string = "default"): SalaryOffer | null {
  const stmt = db.prepare(`
    SELECT id, user_id, job_id, company, role, base_salary, signing_bonus,
           annual_bonus, equity_value, vesting_years, location, status, notes,
           negotiation_outcome, final_base_salary, final_total_comp, created_at, updated_at
    FROM salary_offers
    WHERE id = ? AND user_id = ?
  `);

  const row = stmt.get(id, userId) as {
    id: string;
    user_id: string;
    job_id: string | null;
    company: string;
    role: string;
    base_salary: number;
    signing_bonus: number | null;
    annual_bonus: number | null;
    equity_value: number | null;
    vesting_years: number | null;
    location: string | null;
    status: string;
    notes: string | null;
    negotiation_outcome: string | null;
    final_base_salary: number | null;
    final_total_comp: number | null;
    created_at: string;
    updated_at: string;
  } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    jobId: row.job_id || undefined,
    company: row.company,
    role: row.role,
    baseSalary: row.base_salary,
    signingBonus: row.signing_bonus || undefined,
    annualBonus: row.annual_bonus || undefined,
    equityValue: row.equity_value || undefined,
    vestingYears: row.vesting_years || undefined,
    location: row.location || undefined,
    status: row.status as SalaryOffer["status"],
    notes: row.notes || undefined,
    negotiationOutcome: row.negotiation_outcome || undefined,
    finalBaseSalary: row.final_base_salary || undefined,
    finalTotalComp: row.final_total_comp || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Create a new salary offer
export function createSalaryOffer(
  input: CreateSalaryOfferInput,
  userId: string = "default"
): SalaryOffer {
  const id = generateId();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO salary_offers (
      id, user_id, job_id, company, role, base_salary, signing_bonus,
      annual_bonus, equity_value, vesting_years, location, status, notes,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
  `);

  stmt.run(
    id,
    userId,
    input.jobId || null,
    input.company,
    input.role,
    input.baseSalary,
    input.signingBonus || null,
    input.annualBonus || null,
    input.equityValue || null,
    input.vestingYears || null,
    input.location || null,
    input.notes || null,
    now,
    now
  );

  return {
    id,
    userId,
    jobId: input.jobId,
    company: input.company,
    role: input.role,
    baseSalary: input.baseSalary,
    signingBonus: input.signingBonus,
    annualBonus: input.annualBonus,
    equityValue: input.equityValue,
    vestingYears: input.vestingYears,
    location: input.location,
    status: "pending",
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
}

// Update a salary offer
export function updateSalaryOffer(
  id: string,
  input: UpdateSalaryOfferInput,
  userId: string = "default"
): SalaryOffer | null {
  const existing = getSalaryOffer(id, userId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updates: string[] = [];
  const params: (string | number | null)[] = [];

  if (input.baseSalary !== undefined) {
    updates.push("base_salary = ?");
    params.push(input.baseSalary);
  }
  if (input.signingBonus !== undefined) {
    updates.push("signing_bonus = ?");
    params.push(input.signingBonus || null);
  }
  if (input.annualBonus !== undefined) {
    updates.push("annual_bonus = ?");
    params.push(input.annualBonus || null);
  }
  if (input.equityValue !== undefined) {
    updates.push("equity_value = ?");
    params.push(input.equityValue || null);
  }
  if (input.vestingYears !== undefined) {
    updates.push("vesting_years = ?");
    params.push(input.vestingYears || null);
  }
  if (input.location !== undefined) {
    updates.push("location = ?");
    params.push(input.location || null);
  }
  if (input.status !== undefined) {
    updates.push("status = ?");
    params.push(input.status);
  }
  if (input.notes !== undefined) {
    updates.push("notes = ?");
    params.push(input.notes || null);
  }
  if (input.negotiationOutcome !== undefined) {
    updates.push("negotiation_outcome = ?");
    params.push(input.negotiationOutcome || null);
  }
  if (input.finalBaseSalary !== undefined) {
    updates.push("final_base_salary = ?");
    params.push(input.finalBaseSalary || null);
  }
  if (input.finalTotalComp !== undefined) {
    updates.push("final_total_comp = ?");
    params.push(input.finalTotalComp || null);
  }

  updates.push("updated_at = ?");
  params.push(now);

  params.push(id);
  params.push(userId);

  const stmt = db.prepare(`
    UPDATE salary_offers
    SET ${updates.join(", ")}
    WHERE id = ? AND user_id = ?
  `);

  stmt.run(...params);

  return getSalaryOffer(id, userId);
}

// Delete a salary offer
export function deleteSalaryOffer(id: string, userId: string = "default"): boolean {
  const stmt = db.prepare(`
    DELETE FROM salary_offers
    WHERE id = ? AND user_id = ?
  `);

  const result = stmt.run(id, userId);
  return result.changes > 0;
}

// Get salary statistics
export function getSalaryStats(userId: string = "default"): {
  totalOffers: number;
  pendingOffers: number;
  acceptedOffers: number;
  declinedOffers: number;
  avgBaseSalary: number;
  avgTotalComp: number;
  highestOffer: number;
} {
  const offers = getSalaryOffers(userId);

  const pendingOffers = offers.filter((o) => o.status === "pending").length;
  const acceptedOffers = offers.filter((o) => o.status === "accepted").length;
  const declinedOffers = offers.filter((o) => o.status === "declined").length;

  const baseSalaries = offers.map((o) => o.baseSalary);
  const avgBaseSalary = baseSalaries.length > 0
    ? baseSalaries.reduce((sum, s) => sum + s, 0) / baseSalaries.length
    : 0;

  const totalComps = offers.map((o) =>
    o.baseSalary +
    (o.annualBonus || 0) +
    ((o.equityValue || 0) / (o.vestingYears || 4))
  );
  const avgTotalComp = totalComps.length > 0
    ? totalComps.reduce((sum, c) => sum + c, 0) / totalComps.length
    : 0;

  const highestOffer = totalComps.length > 0 ? Math.max(...totalComps) : 0;

  return {
    totalOffers: offers.length,
    pendingOffers,
    acceptedOffers,
    declinedOffers,
    avgBaseSalary: Math.round(avgBaseSalary),
    avgTotalComp: Math.round(avgTotalComp),
    highestOffer: Math.round(highestOffer),
  };
}
