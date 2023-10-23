const pluginSEO = require("eleventy-plugin-seo");
const { createHash } = require("crypto");

module.exports = function (eleventyConfig) {
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
