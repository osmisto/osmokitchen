require 'rubygems'
require 'bundler'

Bundler.setup

require 'rack'
# require 'rack/cache'

# use Rack::Cache do
# 	set :verbose, true
# 	set :metastore, "heap:/"
# 	set :entitiystore, "heap:/"
# end

require 'riak-sessions'
use Riak::SessionStore

require './server.rb'
run OSApp
