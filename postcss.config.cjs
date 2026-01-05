/**
 * MD++ PostCSS Configuration
 *
 * Processing order:
 * 1. postcss-import - Inline @import statements
 * 2. postcss-nested - Enable SASS-like nesting (fallback when not using SCSS)
 * 3. postcss-preset-env - Modern CSS features with fallbacks
 * 4. autoprefixer - Add vendor prefixes
 */
module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-nested': {},
    'postcss-preset-env': {
      stage: 2,
      features: {
        'nesting-rules': true,
        'custom-properties': true,
        'custom-media-queries': true,
      },
    },
    'autoprefixer': {},
  },
};
