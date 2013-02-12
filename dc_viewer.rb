require 'sinatra/base'
require 'jammit/sinatra'
require 'jammit'

# When testing remote data access the viewer 
# cannot be loaded from a file:// url
# 
# This is a minimal sinatra app with just
# enough power to serve the assets from Jammit
#


class DcViewer < Sinatra::Base

  register Padrino::Helpers
  register Jammit

  get "/" do
    'hard-coded document in view is not longer supported, instead append document slug to root url'
  end

  get "/:document_id" do
    # this sets Jammit to 
    # always run in development mode
    Jammit.set_package_assets(false)
    erb :index
  end

end
