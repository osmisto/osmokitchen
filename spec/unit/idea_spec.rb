require 'spec_helper'

describe Idea do
  before :each do
    @idea     = Idea.new({:id => 1, :body => 'abody', :status => 'published'})
    @draft    = Idea.new({:id => 2, :body => 'abody', :status => 'draft'})
    @closed   = Idea.new({:id => 3, :body => 'abody', :status => 'closed'})
    @removed  = Idea.new({:id => 4, :body => 'abody', :status => 'removed'})
  end

  it "should safely update with unknown and RO attributes" do
    @idea.safe_update({
      :id => 100,
      :unknownAttr => 'qwer',
      :body => 'newBody'
    })
    @idea.valid?.should be == true
    @idea.body.should be == 'newBody'
    @idea.id.should be == "1"
  end

  it "should allow publish idea" do
    @draft.safe_update({ :status => 'published' });
    @draft.valid?.should be == true
    @draft.status.should be == 'published'
  end

  it "should NOT allow update status back to draft" do
    @idea.safe_update({:status => 'draft'})
    @idea.valid?.should be == false
    @idea.errors[:status].size.should be == 1
  end

  it "should allow close published idea" do
    @idea.safe_update({:status => 'closed'});
    @idea.valid?.should be == true
    @idea.status.should be == 'closed'
  end

  it "should allow open closed idea" do
    @closed.safe_update({:status => 'published'});
    @closed.valid?.should be == true
    @closed.status.should be == 'published'
  end

  it "should allow remove idea" do
    @idea.safe_update({:status => 'removed'});
    @idea.valid?.should be == true
    @idea.status.should be == 'removed'
  end

  it "should allow restore idea" do
    @removed.safe_update({:status => 'published'});
    @removed.valid?.should be == true
    @removed.status.should be == 'published'
  end

  it "should NOT allow nonstandard statuses" do
    @idea.safe_update({ :status => 'lololo' })
    @idea.valid?.should be == false
    @idea.errors[:status].size.should be == 1
  end

  it "should strip HTML tags in subject" do
    @idea.safe_update({ :subject => 'The <strong>heavy</strong> topic'})
    @idea.save!
    @idea.subject.should be == 'The heavy topic'
  end

  it "should strip dangerous HTML tags in body and short body" do
    bad = 'The <strong>heavy</strong> topic<script>alert("lololo")</script>.'
    good = 'The <strong>heavy</strong> topicalert("lololo").'
    @idea.safe_update({
      :body => bad,
      :short => bad
    })
    @idea.save!
    @idea.body.should be == good
    @idea.short.should be == good
  end

end
