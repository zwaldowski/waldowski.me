require "bootstrap"
require "rails-assets-tether-tooltip"
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
set :partials_dir, 'shared'

page "humans.txt", :layout => false

configure :development do
  activate :livereload
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
  s3_sync.aws_access_key_id          = ENV['AWS_ACCESS_KEY_ID']
  s3_sync.aws_secret_access_key      = ENV['AWS_SECRET_ACCESS_KEY']
end

after_configuration do
  caching_policy 'text/html',    :s_maxage => 31_536_000, :max_age => 0, :must_revalidate => true
  default_caching_policy         :max_age => 31_536_000, public: true, must_revalidate: true, proxy_revalidate: true
end
