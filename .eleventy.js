const pluginSEO = require("eleventy-plugin-seo");
const { createHash } = require("crypto");

/**
 * This is the JavaScript code that determines the config for your Eleventy site
 *
 * You can add lost of customization here to define how the site builds your content
 * Try extending it to suit your needs!
 */

module.exports = function (eleventyConfig) {
  eleventyConfig.setTemplateFormats([
    // Templates:
    "html",
    "njk",
    "md",
    // Static Assets:
    "css",
    "jpeg",
    "jpg",
    "png",
    "svg",
    "woff",
    "woff2",
  ]);
  eleventyConfig.addPassthroughCopy("public");

  eleventyConfig.addPlugin(pluginSEO, require("./src/_data/metadata.json"));

  eleventyConfig.addFilter("gravatar", function (email, size) {
    const hash = createHash("md5")
      .update(email.trim().toLowerCase())
      .digest("hex");
    const search = size ? `?s=${size}` : "";
    return `https://www.gravatar.com/avatar/${hash}${search}`;
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "build",
    },
  };
};
