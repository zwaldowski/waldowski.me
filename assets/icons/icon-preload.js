AFontGarde("<%= font_name %>", "<% @glyphs.each do |_, value| %>\u<%= value[:codepoint].to_s(16) %><% end %>");
