/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  verbose: true,

  // Support ESM + TypeScript
  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },

  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
};

