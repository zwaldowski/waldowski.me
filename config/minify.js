const htmlmin = require("html-minifier-terser")

module.exports = (eleventyConfig) => {
  const isProduction = process.env.NODE_ENV === "production"

  eleventyConfig.addTransform("htmlmin", async (content, filename) => {
    if (!isProduction || !filename.endsWith(".html")) {
      return content
    }

    return await htmlmin.minify(content, {
      collapseWhitespace: true,
      decodeEntities: true,
      minifyCSS: true,
    })
  })
}
