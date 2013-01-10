require 'spec_helper'

describe "Difference::ClassMethods", :integration => true do
  before :each do
    @user = User.create_new('test_nick')
    @idea = Idea.create_new(@user)
  end

  it "should create new diff from just an object" do
    @idea.body = 'another one'
    @idea.tags = ['tag']
    @idea.comments = 100
    diff = Difference.create_new(@idea)

    diff.original[:bucket].should be == @idea.robject.bucket.name
    diff.original[:key].should be == @idea.robject.key

    diff.old[:body].should be == '<em>TODO: write idea body</em>'
    diff.old[:tags].should be == []
    diff.old[:subject].nil?.should be == true  # was not modified
    diff.old[:comments].nil?.should be == true # is not in safe to modify list

    diff.new[:body].should be == 'another one'
    diff.new[:tags].should be == ['tag']
    diff.new[:subject].nil?.should be == true  # was not modified
    diff.new[:comments].nil?.should be == true # is not in safe to modify list
  end
end

