module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageThreshold: {
    global: {
      global: 80,
      functions: 80,
      lines: 80,
      statements: -10
    }
  }
};