const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const postcssSass = require("@csstools/postcss-sass");
const postcssScss = require("postcss-scss");
const tailwindcssNesting = require("tailwindcss/nesting");
const postcssImport = require("postcss-import");

module.exports = {
  plugins: [
    postcssImport(), 
    tailwindcss(),
    tailwindcssNesting(),
    postcssSass(),
    autoprefixer()
  ],
  syntax: postcssScss
};
