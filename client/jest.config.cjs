/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "svelte/store": "<rootDir>/test/svelte-store-stub.ts",
    "@capacitor/preferences": "<rootDir>/test/capacitor-stub.ts",
    analytics: "<rootDir>/test/stub.ts",
  },
};
