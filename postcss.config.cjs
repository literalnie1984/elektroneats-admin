const tailwindcss = require("tailwindcss");
const autoprefixer = require( "autoprefixer");
const postcssSass = require("@csstools/postcss-sass");
const postcssScss = require("postcss-scss");

module.exports = {
  plugins: [
    postcssSass(),
    tailwindcss(),
    autoprefixer()
  ],
  syntax: postcssScss
};
