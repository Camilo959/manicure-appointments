/** @type {import("jest").Config} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Shared DB + global cleanup hooks require serial execution to avoid cross-suite races.
  maxWorkers: 1,
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  globalSetup: '<rootDir>/src/__tests__/setup/global-setup.ts',
  globalTeardown: '<rootDir>/src/__tests__/setup/global-teardown.ts',
  testTimeout: 30000,
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
    ],
  },
    transformIgnorePatterns: [
    "node_modules/(?!(uuid)/)"
  ],
};
