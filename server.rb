#!/usr/bin/env ruby
require 'sinatra'
require 'sinatra/base'
require 'sinatra/json'
require 'logger'
require_relative 'lib/sinatra_hacks'
require 'json'
require 'pry'
require 'pry-doc'
require 'pry-nav'
require 'pry-stack_explorer'


require_relative 'models/init'
Riak.disable_list_keys_warnings = true


class OSApp < Sinatra::Application
  helpers Sinatra::JSON

  set :public_folder, "./static"
  set :json_encoder, :to_json

  configure :production do
  end

  configure :development do
    enable :logging, :dump_errors, :rise_erros
    #logger.datetime_format = "%H:%M:%S "
    #logger.level = Logger::DEBUG
  end

  before do
    @current_user = User.find(session['current_user']) || User.get_guest
  end

  before :request_method => [ :post, :put ] do
    @data = JSON.parse(request.env["rack.input"].read).with_indifferent_access
  end

  get '/' do
    erb :index
  end

  #
  #  Current user logic
  #
  # Get current_user info
  get '/current_user' do
    json @current_user.attributes.to_hash
  end

  # is != null -> Login handler
  put '/current_user' do
    new_user = false;
    @current_user = User.find(@data[:id])
    if @current_user.nil?
      @current_user = User.create_new(@data[:id])
      new_user = true;
    end

    session['current_user'] = @data[:id]
    json @current_user.attributes.to_hash.update({:new_user => new_user})
  end

  # id = null -> Logout
  post '/current_user' do
    session['current_user'] = nil
    @current_user = User.get_guest
    json @current_user.attributes.to_hash
  end

  get '/ideas' do
    options = {:is_public => 1}
    options[:order_by] = params[:order_by] || :id
    options[:order_asc] = params[:order_asc].to_s == ''

    tags = params[:tags].to_s.split(/\s+/)
    options[:tag] = tags if tags.any?

    filters = params[:filters].to_s.split(/\s+/)
    options[:with_comments] = 1 if (filters.include? "w_comments")
    options[:with_comments] = 0 if (filters.include? "wo_comments")
    options[:with_votes] = 1 if (filters.include? "w_votes")
    options[:with_votes] = 0 if (filters.include? "wo_votes")
    options[:dist] = 'close' if (filters.include? "close_to_goal")
    options[:dist] = 'finish' if (filters.include? "reached_goal")
    options[:status] = 'closed' if (filters.include? "closed")
    options[:is_open] = 1 if (filters.include? "opened")

    collection = Idea.ordered_query(options)

    json({ :ideas => collection.map {|idea| idea.attributes.to_hash},
           :tags => Idea.extract_tags(collection)})
  end

  get '/ideas/templates' do
    templates = Template.ordered_query(:removed => 0, :order_by => :category)
    json templates.map {|template| template.attributes.to_hash}
  end

  # Create new Idea
  post '/ideas' do
    @current_user.can!('member')
    idea = Idea.create_new(@current_user, @data)
    json idea.attributes.to_hash
  end

  get '/ideas/:id' do
    idea = Idea.find!(params[:id])
    json idea.attributes.to_hash
  end

  put '/ideas/:id' do
    idea = Idea.find(params[:id])
    @current_user.can!('admin', idea[:author_key])
    idea.safe_update(@data)
    idea.save!
    json idea.attributes.to_hash
  end

  get '/ideas/:id/votes' do
    votes = Vote.query({:idea_key => params[:id], :order_by => :cache})
    json votes.map {|vote| vote.attributes.to_hash}
  end


  get '/current_user/votes' do
    votes = Vote.query({:user_key => @current_user.id})
    json votes.map {|vote| vote.attributes.to_hash}
  end

  # New vote
  post '/votes' do
    @current_user.can!('member')
    vote = Vote.create_new(@current_user, @data[:idea_key], @data)
    json vote.attributes.to_hash
  end

  # Read vote
  get '/votes/:id' do
    vote = Vote.find(params[:id])
    json vote.attributes.to_hash
  end

  # Update vote
  put '/votes/:id' do
    vote = Vote.find!(params[:id])
    @current_user.can!('root', vote.user[:id])
    puts @data.inspect
    vote.safe_update(@data)
    vote.save
    json vote.attributes.to_hash
  end

  delete '/votes/:id' do
    vote = Vote.find!(params[:id])
    @current_user.can!('root', vote.user[:id])
    vote.destroy
  end

  get '/tags' do
    tags = Tag.ordered_query({:used_in_idea => 1, :order_by => :count})
    json tags.map {|tag| tag.attributes.to_hash}
  end

  get '/templates' do
    templates = Template.ordered_query(:order_by => :category)
    json templates.map {|template| template.attributes.to_hash}
  end

  get '/templates/:id' do
    template = Template.find(params[:id])
    json template.attributes.to_hash
  end

  put '/templates/:id' do
    puts @current_user.inspect
    @current_user.can!('admin')
    template = Template.find!(params[:id])
    template.logged_update(@current_user, @data)
    template.save!
    json template.attributes.to_hash
  end

  post '/templates' do
    @current_user.can!('admin')
    template = Template.create_new(@data[:type], @current_user, @data)
    json template.attributes.to_hash
  end
end
