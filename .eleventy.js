const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")
const activitypub = require("eleventy-plugin-activity-pub")
const markdownIt = require("markdown-it")
const minify = require("./config/minify.js")
const meta = require("./src/_data/meta.json")

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(activitypub, meta.activitypub)
  eleventyConfig.addPlugin(minify)
  eleventyConfig.addPlugin(syntaxHighlight)

  eleventyConfig.addPassthroughCopy("src/assets")

  eleventyConfig.addCollection("home", (collections) =>
    collections
      .getAll()
      .filter((a) => a.data.title)
      .sort((a, b) => {
        const aDate = a.data.updated ?? a.date
        const bDate = b.data.updated ?? b.date
        return bDate - aDate
      }),
  )

  const markdown = new markdownIt({
    html: true,
    typographer: true,
  })

  eleventyConfig.setLibrary("md", markdown)
  eleventyConfig.addFilter("typography", (input) =>
    markdown.renderInline(input),
  )

  return {
    dir: {
      input: "src",
    },
  }
}
