require 'spec_helper'

describe "Template::ClassMethods", :integration => true do
  before :all do
    @user = User.create_new('test_nick')
  end

  it "should create normal default idea" do
    idea_template = Template.create_new(:idea, @user)
    idea_template.type.should be == 'idea'
    idea_template.author_key.should be == @user.id
    idea_template.author_nick.should be == @user.nick
  end

  it "should add (1) if template with same name/category exists, and then (2)" do
    t = Template.create_new(:idea, @user, {:name => 'name', :category => 'category'})
    t.name.should be == 'name'
    t = Template.create_new(:idea, @user, {:name => 'name', :category => 'category'})
    t.name.should be == 'name (1)'
    t = Template.create_new(:idea, @user, {:name => 'name', :category => 'category'})
    t.name.should be == 'name (2)'
  end

  it "should parse brackets and increment number, if they were in create_new arguments " do
    t = Template.create_new(:idea, @user, {:name => 'name (1)', :category => 'category'})
    t.name.should be == 'name (3)'
  end

  it "should not set 'name (1)' if you save with another category" do
    t = Template.create_new(:idea, @user, {:name => 'name', :category => 'another'})
    t.name.should be == 'name'
  end

  it "should strip tags from name, category, description" do
    t = Template.create_new(:idea, @user, {
      :name => '<b>test</b>',
      :category => '<b>test</b>',
      :description => '<b>test</b>'
    })
    t.name.should be == 'test'
    t.category.should be == 'test'
    t.description.should be == 'test'
  end

  it "should safe_update only allowed values" do
    t = Template.create_new(:idea, @user, {
      :name => 'name'
    })
    t.safe_update({
      :name => 'another name',
      :author_nick => 'foobar'
    })
    t.name.should be == 'another name'
    t.author_nick.should be == @user.nick
  end
end


describe "IdeaTemplate::ClassMethods", :integration => true do
  before :all do
    @user = User.create_new('test_nick')
  end

  it "should create tags if they are missed" do
    idea_template = Template.create_new(:idea, @user, {
        :tags => ['tag']
      })
    Tag.find('tag').nil?.should be == false
  end

  it "should sanitize HTML for body, subject, short" do
    idea_template = Template.create_new(:idea, @user, {
        :subject => '<b>test</b>',
        :short => '<b>test</b><script>alert(123)</script>',
        :body => '<b>test</b><script>alert(123)</script>',
      })

    idea_template.subject.should be == 'test'
    idea_template.short.should be == '<b>test</b>alert(123)'
    idea_template.body.should be == '<b>test</b>alert(123)'
  end

end
