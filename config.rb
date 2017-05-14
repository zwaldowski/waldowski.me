require "bootstrap"
require "nokogiri"

# Methods defined in the helpers block are available in templates
helpers do

  def inline_svg(icon_name)
    root = Middleman::Application.root
    icon_file = File.join(root, 'assets/icons', "#{icon_name}.svg")
    icon = File.open(icon_file) { |f| Nokogiri::XML(f) }
    icon.remove_namespaces!

    svg = icon.at_css "svg"
    svg["aria-hidden"] = :true
    svg["class"] = "svgcon svgcon-#{icon_name.to_s.dasherize}"
    svg["role"] = :img
    svg.delete "width"
    svg.delete "height"

    svg
  end

  def link_icon_only(text, link, icon_name, options={})
    options['data-tooltip'] = text
    options['aria-label'] = text
    link_to(link, options) do
      inline_svg(icon_name).to_s
    end
  end

  def defer_load_webfont_tags(families)
    html = content_tag :script, "WebFontConfig={google:{families:[\"#{families}\"]}},function(){var e=document.createElement(\"script\");e.src=\"https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js\",e.type=\"text/javascript\",e.async=\"true\";var t=document.getElementsByTagName(\"script\")[0];t.parentNode.insertBefore(e,t)}();", :type => 'text/javascript'
    html << content_tag(:noscript, stylesheet_link_tag("https://fonts.googleapis.com/css?family=#{families}"))
    html
  end

end


set :css_dir, 'styles'
set :js_dir, 'scripts'
set :images_dir, 'images'

activate :sprockets

page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

configure :development do
  activate :livereload
end

configure :build do
  activate :autoprefixer
  activate :minify_css
  activate :minify_javascript
  activate :asset_hash
end
