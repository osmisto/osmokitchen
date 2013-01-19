require 'spec_helper'

describe "Vote::ClassMethods", :integration => true do
  before :all do
    @user = User.create_new('test_nick')
    @idea = Idea.create_new(@user)
  end

  it "should create new vote with good arguments" do
    vote = Vote.create_new(@user, @idea)
    vote.author_key.should be == @user.id
    vote.author_nick.should be == @user.nick
    vote.author_hash.should be == @user.hash
    vote.idea_key.should be == @idea.id
    vote.cache.should be == 0
    vote.destroy
  end

  it "should create new vote with ids instead of objects" do
    vote = Vote.create_new(@user, @idea)
    vote.author_key.should be == @user.id
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
    Vote.list.each {|vote| vote.destroy} # to be sure no votes exists
    vote = Vote.create_new(@user, @idea);
    expect {Vote.create_new(@user, @idea)}.to raise_error(RuntimeError)
  end

  it "should not allow to create vote for missed idea" do
    idea = Idea.create_new(@user)
    idea.destroy
    expect {Vote.create_new(@user, idea)}.to raise_error(Ripple::DocumentNotFound)
  end
end
