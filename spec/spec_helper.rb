$LOAD_PATH.unshift(File.dirname(__FILE__))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), '..'))

require 'rubygems' # Use the gems path only for the spec suite
require 'ripple'
require 'rspec'
require 'models/init'

Riak.disable_list_keys_warnings = true

RSpec.configure do |config|
  config.mock_with :rspec
  config.formatter = :documentation

  riak_models = [User, Idea, Vote, Tag, Counter, Template, Difference]

  config.before :suite do
    riak_models.each do |cls|
      cls.bucket_name = 'test_' + cls.bucket_name
    end
  end

  config.before :all do
    riak_models.each do |cls|
      cls.bucket.keys.each do |key|
        cls.bucket.delete(key)
      end
    end
  end

end
