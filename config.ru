require 'rubygems'
require 'bundler'


Bundler.require


configure do
  ::RAILS_ENV = "development"
  Jammit.load_configuration( File.expand_path( './config/assets.yml' ) )

end

require File.expand_path( './dc_viewer' )

run DcViewer
