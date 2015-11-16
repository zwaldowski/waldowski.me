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

  def icon_codepoint(icon_name)
    data.icons[icon_name]
  end

  def link_icon_fallback(text, link, icon_name)
    link_to(link, options = { :class => 'icon-fallback', 'data-tooltip' => text }) do
      [
        content_tag(:i, '', 'aria-hidden' => 'true', 'data-icon' => icon_codepoint(icon_name)),
        content_tag(:span, text, :class => 'text')
      ].join("")
    end
  end

  def defer_load_webfont_tags(families)
    html = content_tag :script, "WebFontConfig={google:{families:[\"#{families}\"]}},function(){var e=document.createElement(\"script\");e.src=\"https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js\",e.type=\"text/javascript\",e.async=\"true\";var t=document.getElementsByTagName(\"script\")[0];t.parentNode.insertBefore(e,t)}();", :type => 'text/javascript'
    html << content_tag(:noscript, stylesheet_link_tag("https://fonts.googleapis.com/css?family=#{families}"))
    html
  end

end

require 'bootstrap'
require 'rails-assets-tether-tooltip'

set :css_dir, 'styles'
set :js_dir, 'scripts'
set :images_dir, 'images'
set :partials_dir, 'shared'

page "humans.txt", :layout => false

configure :development do
  activate :livereload
  activate :fontcustom do |fc|
    fc.font_name = 'icons'
    fc.source_dir = 'assets/icons'
    fc.css_dir = 'source/styles'
    fc.templates = 'icons.yml _icon-custom.scss _icon-preload.js'
    fc.template_dirs = {
      'icons.yml' => 'data',
      'icon-preload.js' => 'source/scripts'
    }
  end
end

configure :build do
  activate :autoprefixer
  activate :minify_css
  activate :minify_javascript
  activate :asset_hash
  activate :gzip, exts: %w(.js .css .html .svg)
end

activate :s3_sync do |s3_sync|
  s3_sync.bucket                     = 'waldowski.me'
  s3_sync.region                     = 'us-east-1'
  s3_sync.aws_access_key_id          = ENV['AWS_ACCESS_KEY']
  s3_sync.aws_secret_access_key      = ENV['AWS_SECRET']
end

activate :cloudfront do |cf|
  cf.access_key_id = ENV['AWS_ACCESS_KEY']
  cf.secret_access_key = ENV['AWS_SECRET']
  cf.distribution_id = 'E1SJ0WWQZT7G4Z'
end

after_s3_sync do |files_by_status|
  invalidate files_by_status[:updated]
end
