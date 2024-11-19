import { minify } from "html-minifier-terser"
import { bundle } from "lightningcss"

export default (eleventyConfig) => {
  const isProduction = process.env.NODE_ENV === "production"

  eleventyConfig.addTemplateFormats("css")
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: (content, filename) => () => {
      const result = bundle({
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

    return await minify(content, {
      collapseWhitespace: true,
      decodeEntities: true,
      minifyCSS: true,
      removeComments: true
    })
  })
}
