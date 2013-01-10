require 'spec_helper'

describe "Idea::ClassMethods", :integration => true do
  before do
    @user = User.create_new('test_nick')
  end

  it "should create normal default idea" do
    idea = Idea.create_new(@user)
    idea.id.should match(/^\d+$/)
    idea.author_key.should be == @user.id
    idea.status.should be == 'draft'
  end

  it "should acccept extended hash with safe params on create" do
    idea = Idea.create_new(@user, {:status => "published"})
    idea.status.should be == 'published'
  end

  it "should not create idea for nil user" do
    expect { Idea.create_new }.to raise_error(ArgumentError)
  end

  it "should not create idea with bad safe params" do
    expect { Idea.create_new(@user, {:status => "lololo"}) }.to raise_error(Ripple::DocumentInvalid)
  end
end

describe "Idea#query filters", :integration => true do
  before :all do
    @bob = User.create_new('test_bob');
    @john = User.create_new('test_john');

    @idea1  = Idea.create_new(@bob, {:status => 'draft',      :tags => ['t1', 't2']})
    @idea2  = Idea.create_new(@bob, {:status => 'published',  :tags => ['t3']})
    @idea3  = Idea.create_new(@bob, {:status => 'closed',     :tags => ['t2']})
    @idea4  = Idea.create_new(@bob, {:status => 'removed',    :tags => ['t1']})
    @idea5  = Idea.create_new(@john, {:status => 'published'})
    @idea6  = Idea.create_new(@bob, {:status => 'removed'})
    @idea7  = Idea.create_new(@bob, {:status => 'published', :goal => 200}); @idea7.cache = 300; @idea7.save
    @idea8  = Idea.create_new(@bob, {:status => 'published', :goal => 200}); @idea8.cache = 195; @idea8.save
    @idea9  = Idea.create_new(@bob, {:status => 'published'}); @idea9.cache = 150; @idea9.save
    @idea10 = Idea.create_new(@bob, {:status => 'published'}); @idea10.comments = 5; @idea10.save
    @idea11 = Idea.create_new(@bob, {:status => 'published'}); @idea11.votes = 5; @idea11.save
  end

  it "should return non-closed, non-draft entries" do
    get_ids(Idea.query({
      :is_public => 1,
      :is_open => 1
    })).should be == get_ids([@idea2, @idea5, @idea7, @idea8, @idea9, @idea10, @idea11])
  end

  it "should return ideas with and w/o comments" do
    get_ids(Idea.query({
        :with_comments => 1,
        :status => 'published'
      })).should be == get_ids([@idea10])
    get_ids(Idea.query({
        :with_comments => 0,
        :status => 'published'
      })).should be == get_ids([@idea2, @idea5, @idea7, @idea8, @idea9, @idea11])
  end

  it "should return ideas with and w/o votes" do
    get_ids(Idea.query({
        :with_votes => 1,
        :status => 'published'
      })).should be == get_ids([@idea11])
    get_ids(Idea.query({
        :with_votes => 0,
        :status => 'published'
      })).should be == get_ids([@idea2, @idea5, @idea7, @idea8, @idea9, @idea10])
  end

  it "should return ideas by distance" do
    get_ids(Idea.query({
        :dist => 'finish',
      })).should be == get_ids([@idea7])
    get_ids(Idea.query({
        :dist => 'close',
      })).should be == get_ids([@idea8])
  end

  it "should return ideas by owner" do
    get_ids(Idea.query({
        :author_key => @john.id,
      })).should be == get_ids([@idea5])
  end

  it "should return ideas by tags" do
    get_ids(Idea.query({
        :tag => ['t1'],
      })).should be == get_ids([@idea1, @idea4])
    get_ids(Idea.query({
        :tag => ['t1', 't2'],
      })).should be == get_ids([@idea1])
    get_ids(Idea.query({
        :tag => ['t2'],
      })).should be == get_ids([@idea1, @idea3])
  end

  def get_ids(list)
    list.map {|idea| idea.id}.sort
  end
end

describe "Idea#ordered_query sorting", :integration => true do
  before :all do
    @user = User.create_new('test_bob');

    @i1  = gen_idea :cache => 500, :votes => 6, :goal => 400
    @i2  = gen_idea :cache => 50,  :votes => 5, :goal => 400
    @i3  = gen_idea :cache => 390, :votes => 2, :goal => 400
    @i4  = gen_idea :cache => 40,  :votes => 0, :goal => 400
    @i5  = gen_idea :cache => 400, :votes => 6, :goal => 400
  end

  it "should sort by votes" do
    list = Idea.ordered_query(:order_by => :votes, :order_asc => false);
    get_ids(list).should be == get_ids([@i5, @i1, @i2, @i3, @i4])
  end

  it "should sort by cache" do
    list = Idea.ordered_query(:order_by => :cache, :order_asc => true);
    get_ids(list).should be == get_ids([@i4, @i2, @i3, @i5, @i1])
  end

  it "should sort by readiness" do
    list = Idea.ordered_query(:order_by => :readiness, :order_asc => false);
    get_ids(list).should be == get_ids([@i5, @i1, @i3, @i2, @i4])
  end

  def get_ids(list)
    list.map {|idea| idea.id}
  end

  def gen_idea(attributes)
    idea = Idea.create_new(@user)
    idea.update_attributes(attributes)
    idea.save
    idea
  end
end