require 'spec_helper'

describe "Idea::ClassMethods", :integration => true do
  before do
    @user = User.create_new('test_nick')
    @template = Template.create_new(:idea, @user, {
        :body => 'tempalte body',
        :subject => 'template subject',
        :short => 'template short',
        :tags => ['tag1', 'tag2']
      })
  end

  it "should create idea with template" do
    idea = Idea.create_new(@user, {:template => @template})
    idea.body.should be == 'tempalte body'
    idea.subject.should be == 'template subject'
    idea.short.should be == 'template short'
    idea.tags.should be == ['tag1', 'tag2']
  end
end