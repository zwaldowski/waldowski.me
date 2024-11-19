import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight"
import activityPub from "eleventy-plugin-activity-pub"
import markdownIt from "markdown-it"
import minify from "./config/minify.js"
import meta from "./src/_data/meta.js"

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(activityPub, meta.activityPub)
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
}

export const config = {
  dir: {
    input: "src",
  },
}
