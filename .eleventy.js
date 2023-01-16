const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")
const { createHash } = require("crypto")
const activitypub = require("eleventy-plugin-activity-pub")
const seo = require("eleventy-plugin-seo")
const minify = require("./config/minify.js")
const meta = require("./src/_data/meta.json")

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(activitypub, meta.activitypub)
  eleventyConfig.addPlugin(seo, meta)
  eleventyConfig.addPlugin(minify)
  eleventyConfig.addPlugin(syntaxHighlight)

  eleventyConfig.addPassthroughCopy({
    "node_modules/@picocss/pico/css/pico.min.css": "pico.css",
  })
  eleventyConfig.addPassthroughCopy("src/assets")
  eleventyConfig.addPassthroughCopy("src/custom.css")

  eleventyConfig.addCollection("home", (collections) =>
    collections
      .getAll()
      .filter((a) => a.data.title)
      .sort((a, b) => {
        const aDate = a.data.updated ?? a.date
        const bDate = b.data.updated ?? b.date
        return bDate - aDate
      })
  )

  eleventyConfig.addFilter("avatar", function (email, size) {
    const hash = createHash("md5")
      .update(email.trim().toLowerCase())
      .digest("hex")
    const search = size ? `?s=${size}` : ""
    return `https://gravatar.com/avatar/${hash}.jpg${search}`
  })

  eleventyConfig.addFilter("dateMedium", function (date) {
    return date.toLocaleDateString(this.ctx.meta.lang, {
      dateStyle: "medium",
      timeZone: "UTC",
    })
  })

  eleventyConfig.amendLibrary("md", (markdown) => {
    markdown.options.typographer = true
  })

  return {
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
    },
  }
}
