import * as fs from "fs";
import * as path from "path";

export interface SystemConfig {
  phase: string;
  maxReg: string;
  allowReg: boolean;
  maintenance: boolean;
  festStartDate: string;
}

const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "system_config.json");

export function getSystemConfig(): SystemConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to parse config file:", e);
  }
  return {
    phase: "pre-event",
    maxReg: "50",
    allowReg: true,
    maintenance: false,
    festStartDate: "2026-11-06",
  };
}
