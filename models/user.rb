require 'json'

class User
  ROLES = {
    "none" => 0,
    "guest" => 5,
    "member" => 10,
    "admin" => 50,
    "developer" => 100,
    "root" => 1000
  }

  include Ripple::Document

  property :id, String, :index => true
  property :nick, String, :index => true
  property :provider, String, :index => true
  property :email, String
  property :role, String, :default => 'member', :index => true
  timestamps!
  key_on :id

  #
  # Authorization helpers
  #
  def can(role, author_key = nil)
    raise ArgumentError.new("Unknown role: #{role}") unless ROLES.include?(role)

    if !author_key.nil? && self.id == author_key
      return true
    end
    return ROLES[role] <= ROLES[self.role]
  end

  def can!(*args)
     raise "Access denied" unless can(*args)
  end

  #
  # Class methods
  #
  def self.get_guest
    user = self.find("osmostarter_guest")
    return user if user

    user = User.new({
      :id => "osmostarter_guest",
      :role => "none",
      :nick => "guest",
      :provider => "osmostarter"
    })
    user.save
    user
  end

  def self.create_new(id, options = {})
    provider, nick = id.split('_', 2)
    raise ArgumentError.new("pass id in <provider>_<nick> form") if nick.nil?
    user = User.new(options.merge(
      :id => id,
      :nick => nick,
      :provider => provider
    ));
    user.save
    user
  end

end
