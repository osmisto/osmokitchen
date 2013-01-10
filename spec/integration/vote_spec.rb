require 'spec_helper'

describe "Vote::ClassMethods", :integration => true do
  before :all do
    @user = User.create_new('test_nick')
    @idea = Idea.create_new(@user)
  end

  it "should create new vote with good arguments" do
    vote = Vote.create_new(@user, @idea)
    vote.user_key.should be == @user.id
    vote.idea_key.should be == @idea.id
    vote.cache.should be == 0
    vote.destroy
  end

  it "should create new vote with ids instead of objects" do
    vote = Vote.create_new(@user.id, @idea.id)
    vote.user_key.should be == @user.id
    vote.idea_key.should be == @idea.id
    vote.destroy
  end

  it "should create a vote with extended hash" do
    vote = Vote.create_new(@user, @idea, {
      :body => "a body",
      :cache => 2.22
    })
    vote.body.should be == 'a body'
    vote.cache.should be == 2.22
    vote.destroy
  end

  it "should not allow to create duplicated vote" do
    vote = Vote.create_new(@user, @idea);
    expect {Vote.create_new(@user, @idea)}.to raise_error(RuntimeError)
  end

  it "should not allow to create vote for missed idea" do
    idea = Idea.create_new(@user)
    idea.destroy
    expect {Vote.create_new(@user, idea)}.to raise_error(Ripple::DocumentNotFound)
  end
end
