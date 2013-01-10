require 'spec_helper'

describe "Template#logged_update", :integration => true do

  before :each do
    @user = User.create_new('test_nick')
    @template = Template.create_new(:idea, @user)
    @template.logged_update(@user, {
        :body => 'another one',
        :subject => 'new subject',
        :tags => ['test', 'test2']
    })
    @template.save
  end

  it "should update props after logged_update" do
    @template.body.should be == 'another one'
    @template.subject.should be == 'new subject'
    @template.short.should be == 'TODO! change'   # was not changed
    @template.tags.should be == ['test', 'test2']
  end

  it "should update self.changelog on logged_update" do
    entry = @template.changelog[0]
    entry.nil?.should be == false
    entry.author_key.should be == @user.id
    entry.author_nick.should be == @user.nick
  end

  it "should set good action and changes for changelog entry" do
    entry = @template.changelog[0]
    entry.action.should be == 'update'
    entry.difference.nil?.should be == false
    entry.resume.should be == [
      'body',
      'subject',
      'tags'
    ]
  end
end
