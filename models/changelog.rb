
class ChangeEntry
  include Ripple::EmbeddedDocument

  timestamps!

  property :author_key, String, :presence => true
  property :author_nick, String, :presence => true
  property :difference_key, String, :presence => true
  property :action, String, :presence => true
  property :resume, Array, :presence => true, :default => []

  one :author, :using => :stored_key, :class_name => "User"
  one :difference, :using => :stored_key, :class_name => "Difference"

  def self.create_new(action, author, object)
    diff = Difference.create_new(object)
    entry = self.new({
      :author_key => author.id,
      :author_nick => author.nick,
      :difference_key => diff.key,
      :action => action
    })
    diff.old.each do |prop, old_value|
      entry.resume << prop
    end
    entry
  end
end

class Difference
  include Ripple::Document

  timestamps!
  property :old, Hash, :default => {}
  property :new, Hash, :default => {}
  property :original, Hash

  def self.create_new(object)
    diff = self.new
    diff.original = {
      :bucket => object.robject.bucket.name,
      :key => object.robject.key
    }

    object.changes.each do |prop, values|
      next if object.class.are_safe && !object.class.are_safe[prop]
      diff.old[prop] = values[0]
      diff.new[prop] = values[1]
    end
    diff.save!
    diff
  end
end
