class Idea
  include Ripple::Document

  STATUSES = {
    'draft' => 1,
    'published' => 10,
    'closed' => 20,
    'removed' => 20
  }

  before_save :update_tags
  before_save :update_readiness
  before_destroy :free_tags
  before_validation :sanitize_content
  validate :validate_content

  property :id, String
  timestamps!
  key_on :id

  # Own properties
  property :status, String, :default => 'draft', :index => true
  property :subject, String, :default => 'Draft idea'
  property :short, String, :default => '<em>TODO: write short version</em>'
  property :body, String, :default => '<em>TODO: write idea body</em>'
  property :tags, Array, :default => []
  property :goal, Integer, :default => 0
  are_safe :status, :subject, :short, :body, :tags, :goal

  # Cached counters
  property :votes, Integer, :default => 0
  property :cache, Float, :default => 0
  property :comments, Integer, :default => 0
  property :dist, String, :default => 'unknown', :index => true
  property :readiness, Float, :default => 0

  # Author, and cached data
  one :author, :class_name => "User"
  property :author_nick, String
  property :author_key, String, :index => true

  # Changelog
  many :changelog, :class_name => "ChangeEntry"

  # Dynamic indexes
  index :tag, String do
    Set.new(self.tags)
  end

  index :is_open, Fixnum do
    self.status != 'closed' ? 1 : 0
  end

  index :is_public, Fixnum do
    ['draft', 'removed'].include?(self.status) ? 0 : 1
  end

  index :is_removed, Fixnum do
    self.status == 'removed' ? 1 : 0
  end

  index :with_comments, Fixnum do
    self.comments > 0 ? 1 : 0
  end

  index :with_votes, Fixnum do
    self.votes > 0 ? 1 : 0
  end

  private
  def update_tags
    new_tags = self.tags - self.tags_was
    obsolete_tags = self.tags_was - self.tags

    new_tags.each {|tag| Tag.increment(tag, :ideas)}
    obsolete_tags.each {|tag| Tag.decrement(tag, :ideas)}
  end

  def free_tags
    self.tags.each {|tag| Tag.decrement(tag, :ideas)}
  end

  def update_readiness
    if self.goal == 0
      self.dist, self.readiness = 'unknown', 0
      return
    end

    self.readiness = 100.0 * self.cache / self.goal
    self.readiness = 0 if self.readiness < 0
    if self.readiness >= 100
      self.dist, self.readiness = "finish", 100
      return
    end

    self.dist = case self.readiness
      when 0..25   then "start"
      when 25..50  then "far"
      when 50..75  then "half"
      when 75..90  then "near"
      when 90..100 then "close"
      else "unknown"
    end
  end

  def validate_content
    validate_status if (status_changed?)
  end

  def validate_status
    return if status_was == 'closed' && status == 'published'
    return if status_was == 'removed' && status == 'published'

    unless STATUSES.include?(status)
      return errors.add(:status, "Unkown status '#{status}'")
    end

    if STATUSES[status_was] && (STATUSES[status] < STATUSES[status_was])
      errors.add(:status, "You are not allowed to set previous status")
    end
  end

  def sanitize_content
    self.subject = Sanitize.clean(self.subject) if (self.subject_changed?)
    self.body = Sanitize.clean(self.body, Sanitize::Config::BASIC) if (self.body_changed?)
    self.short = Sanitize.clean(self.short, Sanitize::Config::BASIC) if (self.short_changed?)
  end

  #
  # Class Methods
  #
  def self.create_new(author, values = {})
    idea = new({
      :id => Counter.get_next(self),
      :author => author,
      :author_key => author.id,
      :author_nick => author.nick
    })

    # Apply template
    template = values.delete(:template)
    if template
      template = Template.find(template);
      [:body, :short, :tags, :subject].each do |prop|
        if template[prop]
          idea.update_attribute(prop, template[prop])
        end
      end
    end

    idea.safe_update(values)
    idea.save!
    idea
  end

  def self.get_page(collection, options = {})
    per_page = options[:per_page]
    per_page = 0 unless per_page.is_a?(Integer) && per_page > 0
    page = options[:page]
    page = 0 unless page.is_a?(Integer) && page > 0

    return collection if per_page == 0
    return collection.slice((page - 1) * per_page, per_page)
  end

  def self.extract_tags(collection)
    collection.inject({}) do |res, idea|
      idea.tags.each do |id|
        res[id] ||= 0
        res[id] += 1
      end
      res
    end.map do |id, count|
      {:id => id, :count => count}
    end.sort_by do |tag|
      [-tag[:count], tag[:id]]
    end
  end

end
