require 'sinatra/base'
require 'jammit/sinatra'
require 'jammit'

# When testing remote data access the viewer 
# cannot be loaded from a file:// url
# 
# This is a minimal sinatra app with just
# enough power to serve the assets from Jammit
#

class DVApp < Sinatra::Base

  register Padrino::Helpers
  register Jammit

  get "/" do
    # this sets Jammit to 
    # always run in development mode
    Jammit.set_package_assets(false)
    erb :debug
  end

end
