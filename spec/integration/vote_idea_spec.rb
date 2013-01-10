require 'spec_helper'

describe "Vote-Idea interaction", :integration => true do
  before :all do
    @user = User.create_new('test_nick')
    @idea = Idea.create_new(@user)
    @vote = Vote.create_new(@user, @idea)
  end

  it "should have 0 votes/cache at the begining" do
    @idea.reload
    @idea.votes.should be == 1
    @idea.cache.should be == 0
  end

  it "should update idea on vote creation" do
    @vote.cache = 100
    @vote.save

    @idea.reload
    @idea.votes.should be == 1
    @idea.cache.should be == 100
  end

  it "should support float cache" do
    @vote.cache = 100.50
    @vote.save

    @idea.reload
    @idea.votes.should be == 1
    @idea.cache.should be == 100.50
  end

  it "should add even more votes/cache for second vote" do
    user = User.create_new('test_nick2')
    vote = Vote.create_new(user, @idea)
    vote.cache = 200
    vote.save

    @idea.reload
    @idea.votes.should be == 2
    @idea.cache.should be == 300.50

    vote.destroy
    @idea.reload
    @idea.votes.should be == 1
    @idea.cache.should be == 100.50
  end
end
