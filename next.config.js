const withNextra = require('nextra')({
  theme: 'nextra-theme-docs', //'./theme-test-crap.tsx',
  themeConfig: './theme.config.tsx',
});

module.exports = withNextra();
