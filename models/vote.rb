require 'pry'

class Vote
  include Ripple::Document

  before_create :validate_idea_existence
  before_create :validate_duplication

  before_update :update_idea
  before_create :update_idea_on_create
  before_destroy :update_idea_on_destroy

  property :id, String
  timestamps!
  key_on :id
  # Own properties
  property :cache, Float, :default => 0
  property :body, String
  are_safe :cache, :body
  # Relatives
  property :idea_key, String, :index => true, :presence => true
  property :user_key, String, :index => true, :presence => true
  one :idea, :using => :stored_key
  one :user, :using => :stored_key

  private
  def validate_idea_existence
    Idea.find!(self.idea_key)
  end

  def validate_duplication
    if Vote.query({:user_key => self.user_key, :idea_key => self.idea_key}).any?
      raise "Second vote is not allowed, please, edit old one if you need add more"
    end
  end

  def update_idea
    self.idea.cache +=  - self.cache_was + self.cache
    self.idea.save
  end

  def update_idea_on_create
    self.idea.votes += 1
    self.idea.cache += self.cache
    self.idea.save
  end

  def update_idea_on_destroy
    self.idea.votes -= 1
    self.idea.cache -= self.cache
    self.idea.save
  end

  def self.create_new(user, idea, values = {})
    vote = self.new({
      :user_key => user.respond_to?(:id) ? user.id : user,
      :idea_key => idea.respond_to?(:id) ? idea.id : idea
    })
    vote.safe_update(values)
    vote.save!
    vote
  end
end
