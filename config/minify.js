import { minify } from "html-minifier-terser"
import { transform } from "lightningcss"
import { dirname } from "node:path"
import { compileStringAsync } from "sass"

export default (eleventyConfig) => {
  const isProduction = process.env.NODE_ENV === "production"
  const compileCSS = (css, filename) => () => transform({
    filename,
    code: Buffer.from(css),
    minify: isProduction,
  }).code

  // Process CSS with LightningCSS
  eleventyConfig.addTemplateFormats("css")
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: compileCSS
  })

  // Compile Sass and process with LightningCSS
  eleventyConfig.addTemplateFormats("scss")
  eleventyConfig.ignores.add("**/_*.scss")
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    compile: async function (content, filename) {
      const output = await compileStringAsync(content, {
        loadPaths: [dirname(filename)],
      })

      this.addDependencies(filename, output.loadedUrls)

      return compileCSS(output.css, filename)
    },
  })

  // Minify HTML
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
