const htmlmin = require("html-minifier-terser")
const lightning = require("lightningcss")

module.exports = (eleventyConfig) => {
  const isProduction = process.env.NODE_ENV === "production"

  eleventyConfig.addTemplateFormats("css")
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: (content, filename) => () => {
      const result = lightning.bundle({
        filename,
        code: Buffer.from(content),
        minify: isProduction,
      })

      return result.code.toString()
    },
  })

  eleventyConfig.addTransform("htmlmin", async (content, filename) => {
    if (!isProduction || !filename.endsWith(".html")) {
      return content
    }

    return await htmlmin.minify(content, {
      collapseWhitespace: true,
      decodeEntities: true,
      minifyCSS: true,
      removeComments: true
    })
  })
}
