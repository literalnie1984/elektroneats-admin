const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const postcssSass = require("@csstools/postcss-sass");
const postcssScss = require("postcss-scss");
const tailwindcssNesting = require("tailwindcss/nesting");

module.exports = {
  plugins: [
    postcssSass(),
    tailwindcss(),
    tailwindcssNesting(),
    autoprefixer()
  ],
  syntax: postcssScss
};
