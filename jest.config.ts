import type { Config } from "jest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const config: Config = {
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/tests/unit/**/*.test.ts?(x)"],
      testEnvironment: "jsdom",
      setupFilesAfterEnv: ["<rootDir>/tests/setup/jest-setup.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^jose$": require.resolve("jose"),
        "^@panva/hkdf$": require.resolve("@panva/hkdf"),
      },
      transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest"],
      },
      transformIgnorePatterns: ["node_modules/(?!next-auth|@auth|@panva|jose)"],
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
      testEnvironment: "node",
      globalSetup: "<rootDir>/tests/setup/global-setup.ts",
      setupFilesAfterEnv: ["<rootDir>/tests/setup/db-reset.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^jose$": require.resolve("jose"),
        "^@panva/hkdf$": require.resolve("@panva/hkdf"),
      },
      transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest"],
      },
      transformIgnorePatterns: ["node_modules/(?!next-auth|@auth|@panva|jose)"],
    },
    {
      displayName: "security",
      testMatch: ["<rootDir>/tests/security/**/*.test.ts"],
      testEnvironment: "node",
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^jose$": require.resolve("jose"),
        "^@panva/hkdf$": require.resolve("@panva/hkdf"),
      },
      transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest"],
      },
      transformIgnorePatterns: ["node_modules/(?!next-auth|@auth|@panva|jose)"],
    }
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 85, lines: 85, statements: 85 }
  },
  collectCoverageFrom: [
    "app/api/**/*.ts",
    "lib/**/*.ts",
    "hooks/**/*.ts",
    "components/**/*.tsx",
    "!**/*.d.ts",
    "!**/node_modules/**"
  ]
};

export default config;
