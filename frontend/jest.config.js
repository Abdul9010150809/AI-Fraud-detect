module.exports = {
  moduleNameMapper: {
    // Mock CSS imports for tests
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testEnvironment: 'jsdom',
};
