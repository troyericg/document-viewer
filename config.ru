# setup access to package managers
require 'rubygems'
require 'bundler'

# Require all the gems in the Gemfile
Bundler.require
require 'uri'

# hax for getting Jammit to think it's loading into Rails.
configure do
  ::RAILS_ENV = "development"
  Jammit.load_configuration( File.expand_path( './config/assets.yml' ) )
end

# A minimalist Sinatra app for the purpose
# of testing cross domain data access.
# 
# Also, easy access for changing files 
class ViewerHost < Sinatra::Base
  register Padrino::Helpers
  register Jammit

  # display a default document
  # and when ?resource=someurl is supplied, load that url.
  get "/" do
    resource = params[:resource] ? params[:resource] : 'http://www.documentcloud.org/documents/282753-lefler-thesis.js'
    resource.sub!(/(html|json)$/, "js")
    render_viewer(resource)
  end
  
  def render_viewer(resource, opts={})
    # Set Jammit to always run in development mode
    Jammit.set_package_assets(false)
    options = { 'container' => '#document-viewer' }.merge(opts)
    template = <<-TEMPLATE
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta http-equiv="ClearType" content="true">
    <meta http-equiv="X-UA-Compatible" content="chrome=1" />
    <title>Document Viewer</title>
    <style>
      body { margin: 0; }
    </style>

    <%= include_stylesheets :viewer, :media => 'all' %>
    <%= include_javascripts :viewer, :templates %>

  </head>
  <body>
    <div id="document-viewer"></div>

    <script type="text/javascript">
      window.currentDocument = DV.load('<%= resource %>', <%= options %> );
    </script>
  </body>
</html>
TEMPLATE

    erb template, :locals => { "resource" => resource, "options" => options.to_json }
  end

end

run ViewerHost