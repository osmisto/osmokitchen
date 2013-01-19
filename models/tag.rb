
class TagUsage
  include Ripple::EmbeddedDocument
  property :ideas, Fixnum, :default => 0
  property :projects, Fixnum, :default => 0
  property :templates, Fixnum, :default => 0
  property :total, Fixnum, :default => 0

  def update_total
    self.total = attributes.except(:total).values.inject(0) {|sum, value| sum + value}
  end
end

class Tag
  include Ripple::Document

  property :id, String
  key_on :id
  timestamps!

  property :category, String, :index => true, :default => 'other'
  one :uses, :class => TagUsage
  property :aliases, Array

  index :alias, String do
    Set.new([self.id] + (self.aliases || []))
  end

index :used_in_idea, Fixnum do
    self.uses[:ideas] > 0 ? 1 : 0
  end

  index :used_in_projects, Fixnum do
    self.uses[:projects] > 0 ? 1 : 0
  end

  def self.increment(id, type)
    tag = self.find(id) || self.new({:id => id})
    tag.uses = {} if tag.uses.nil?
    tag.uses[type] ||= 0
    tag.uses[type] += 1
    tag.uses.update_total
    tag.save
  end

  def self.decrement(id, type)
    tag = self.find(id) or return
    tag.uses[type] ||= 0
    tag.uses[type] -= 1 if tag.uses[type] > 0
    if tag.uses.update_total > 0
      tag.save
    else
      tag.destroy
    end
  end

end
