class SubscriptionTarget
  include Ripple::EmbeddedDocument
  property :tracker, Fixnum, :default => 1
  property :rss, Fixnum, :default => 1
  property :email, Fixnum, :default => 1
end

class Subscription
  include Ripple::Document

  property :author_key, String, :index => true, :presence => true
  property :type, String, :index => true, :presence =>true
  timestamps!
end

class IdeaSubscription
  property :idea_key, :index => true, :presence => true
  one :remove, :class => SubscriptionTarget
  one :status_change, :class => SubscriptionTarget
  one :close, :class => SubsctiptionTarget
  one :mellow, :class => SubscriptionTarget
  one :new_vote, :class => SubscriptionTarget
  one :new_comment, :class => SubscriptionTarget
end

class TagSubscription
  property :rule, String, :presence => true
  property :used_tags, Array, :default => [], :presence => true

  one :idea_add, :class => SubscriptionTarget
  one :idea_remove, :class => SubscriptionTarget
  one :idea_status_change, :class => SubscriptionTarget
  one :idea_close, :class => SubsctiptionTarget
  one :idea_mellow, :class => SubscriptionTarget

  index :used_tag, String do
    Set.new(self.used_tags)
  end
end
