require 'spec_helper'

describe IdeaTemplate do
  before :each do
    @idea_template     = IdeaTemplate.new({:id => 1})
  end

  it "should have properties from parent and child classes" do
    @idea_template.subject.empty?.should be == false
    @idea_template.category.empty?.should be == false
  end
end
