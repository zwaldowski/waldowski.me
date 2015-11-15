###
# Compass
###

# Change Compass configuration
# compass_config do |config|
#   config.output_style = :compact
# end

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
# page "/path/to/file.html", :layout => false
#
# With alternative layout
# page "/path/to/file.html", :layout => :otherlayout
#
# A path which all have the same layout
# with_layout :admin do
#   page "/admin/*"
# end

# Proxy pages (https://middlemanapp.com/advanced/dynamic_pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", :locals => {
#  :which_fake_page => "Rendering a fake page with a local variable" }

###
# Helpers
###

# Automatic image dimensions on image_tag helper
# activate :automatic_image_sizes

# Methods defined in the helpers block are available in templates
helpers do

  def link_icon_fallback(text, link, icon_name)
    link_to(link, options = { :class => "icon-fallback", 'data-tooltip' => text }) do
      [
        content_tag(:span, "", :class => "icon icon-#{icon_name}", 'aria-hidden' => 'true'),
        content_tag(:span, text, :class => "text")
      ].join("")
    end
  end

end

require 'bootstrap'
require 'rails-assets-tether-tooltip'

set :css_dir, 'styles'
set :js_dir, 'scripts'
set :images_dir, 'images'
set :partials_dir, 'shared'

page "robots.txt", :layout => false

configure :development do
  activate :fontcustom do |fc|
    fc.font_name = 'icons'
    fc.source_dir = 'assets/icons'
    fc.css_dir = 'source/styles'
    fc.templates = 'scss icon-preload.js'
    fc.template_dirs = { 'icon-preload.js' => 'source/scripts' }
  end

  activate :livereload
end

configure :build do
  activate :autoprefixer
  activate :minify_css
  activate :minify_javascript
  activate :asset_hash
end
