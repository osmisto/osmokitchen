require 'rubygems'
require 'rspec/core/rake_task'
require 'bundler'

Bundler.setup

desc "Spawn new server in development mode"
task 'dev-server' do
  system "rerun --dir . -p '**/*.rb' -- rackup -p 4000"
end

desc "Spawn autotest daemon"
task 'autotest' do
  system "autotest"
end

desc "Spawn console with all models loaded"
task :irb do
  system "bundle exec irb -r './models/init'"
end

desc "Run Unit Specs Only"
RSpec::Core::RakeTask.new(:spec) do |spec|
  spec.rspec_opts = %w[--tag ~integration]
end

namespace :spec do
  desc "Run Integration Specs Only"
  RSpec::Core::RakeTask.new(:integration) do |spec|
    spec.rspec_opts = %w[--profile --tag integration]
  end

  desc "Run All Specs"
  RSpec::Core::RakeTask.new(:all) do |spec|
    spec.rspec_opts = %w[--profile]
  end
end

task :default => "spec"
