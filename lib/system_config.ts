import { prisma } from "@/lib/db";

export interface SystemConfig {
  phase: string;
  maxReg: string;
  allowReg: boolean;
  maintenance: boolean;
  festStartDate: string;
  paymentLink: string; // URL for the college payment portal
}

const SINGLETON_ID = "singleton";

const DEFAULT_CONFIG: SystemConfig = {
  phase: "pre-event",
  maxReg: "50",
  allowReg: true,
  maintenance: false,
  festStartDate: "2026-11-04",
  paymentLink: "",
};

/**
 * Fields safe to expose to unauthenticated visitors (e.g. the register page's
 * "is registration open" check, or the payment-link lookup on the events page).
 * Never include operational fields like `maxReg`/`phase` here.
 */
export type PublicSystemConfig = Pick<SystemConfig, "allowReg" | "maintenance" | "paymentLink">;

export async function getSystemConfig(): Promise<SystemConfig> {
  const row = await prisma.systemConfig.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID, ...DEFAULT_CONFIG },
  });

  return {
    phase: row.phase,
    maxReg: row.maxReg,
    allowReg: row.allowReg,
    maintenance: row.maintenance,
    festStartDate: row.festStartDate,
    paymentLink: row.paymentLink,
  };
}

export async function getPublicSystemConfig(): Promise<PublicSystemConfig> {
  const config = await getSystemConfig();
  return {
    allowReg: config.allowReg,
    maintenance: config.maintenance,
    paymentLink: config.paymentLink,
  };
}

export async function updateSystemConfig(
  patch: Partial<SystemConfig>
): Promise<SystemConfig> {
  const row = await prisma.systemConfig.upsert({
    where: { id: SINGLETON_ID },
    update: patch,
    create: { id: SINGLETON_ID, ...DEFAULT_CONFIG, ...patch },
  });

  return {
    phase: row.phase,
    maxReg: row.maxReg,
    allowReg: row.allowReg,
    maintenance: row.maintenance,
    festStartDate: row.festStartDate,
    paymentLink: row.paymentLink,
  };
}
