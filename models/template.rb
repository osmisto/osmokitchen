
class Template
  include Ripple::Document
  before_validation :sanitize_name
  before_validation :set_unique_name

  property :id, Integer
  timestamps!
  key_on :id

  property :type, String, :index => true
  property :name, String, :default => 'Template', :presence => true
  property :description, String, :default => ''
  property :category, String, :default => 'Other'

  property :author_key, String, :index => true
  property :author_nick, String

  one :author, :using => :stored_key, :class_name => "User"
  many :changelog, :class_name => "ChangeEntry"

  def unique_name
    "#{self.type} --- #{self.name} --- #{self.category}"
  end

  index :unique_name, String do
    self.unique_name
  end

  def sanitize_name
    self.name = Sanitize.clean(self.name) if (self.name_changed?)
    self.category = Sanitize.clean(self.category) if (self.category_changed?)
    self.description = Sanitize.clean(self.description) if (self.description_changed?)
  end

  def set_unique_name
    other = Template.query({:unique_name => self.unique_name})[0]
    return if other.nil? || other.id == self.id
    if name =~ /(.+) \((\d+)\)/
      self.name = "#{$1} (#{$2.to_i + 1})"
    else
      self.name = "#{self.name} (1)"
    end
    set_unique_name
  end


  #
  # Class Methods
  #
  def self.create_new(type, author, values = {})
    cls = if type.to_sym == :idea
            IdeaTemplate
          elsif type.to_sym == :project
            ProjectTemplate
          else
            raise "Unknown type = #{type}"
          end

    template = cls.new({
      :id => Counter.get_next(self),
      :author_key => author.id,
      :author_nick => author.nick,
      :type => type.to_s
    })
    template.safe_update(values)
    template.save!
    template
  end
end

class IdeaTemplate <Template
  before_save :update_tags
  before_validation :sanitize_content

  property :subject, String, :default => 'TODO! change'
  property :body, String, :default => 'TODO! change'
  property :short, String, :default => 'TODO! change'
  property :tags, Array, :default => []
  are_safe :name, :description, :category, :subject, :short, :body, :tags

  def sanitize_content
    self.subject = Sanitize.clean(self.subject) if (self.subject_changed?)
    self.body = Sanitize.clean(self.body, Sanitize::Config::BASIC) if (self.body_changed?)
    self.short = Sanitize.clean(self.short, Sanitize::Config::BASIC) if (self.short_changed?)
  end

  private
  def update_tags
    new_tags = self.tags - self.tags_was
    obsolete_tags = self.tags_was - self.tags

    new_tags.each {|tag| Tag.increment(tag, :tempaltes)}
    obsolete_tags.each {|tag| Tag.decrement(tag, :templates)}
  end
end

