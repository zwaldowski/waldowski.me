import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight"
import markdownIt from "markdown-it"
import minify from "./config/minify.js"

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(minify)
  eleventyConfig.addPlugin(syntaxHighlight)

  eleventyConfig.addPassthroughCopy("src/assets")

  eleventyConfig.addCollection("home", (collections) =>
    collections
      .getAll()
      .filter((a) => {
        if (!a.data.title) return false
        if (a.data.tags?.includes("archive")) return false
        return true
      })
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
