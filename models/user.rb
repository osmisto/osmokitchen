require 'json'
require 'digest/md5'

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

  before_update :validate_duplication
  before_create :validate_duplication
  before_save :update_hash

  property :id, String
  key_on :id
  timestamps!

  property :nick, String, :index => true
  property :provider, String, :index => true
  property :email, String
  property :hash, String
  property :role, String, :default => 'member', :index => true

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
  # Validators
  #
  def validate_duplication
    if User.query({:nick => self.nick}).select {|user| user.id != self.id }.any?
      raise "User with same nick already exists"
    end
  end

  def update_hash
    self.hash = if self.email
      Digest::MD5.hexdigest(self.email.strip.downcase)
    else
      "0" * 32
    end
  end


  #
  # Class methods
  #
  def self.get_guest
    user = self.find("osmostarter_guest")
    return user if user

    user = User.new({
      :id => "9",
      :role => "none",
      :nick => "guest",
      :provider => "osmostarter"
    })
    user.save
    user
  end

  def self.create_new(auth_key, options = {})
    provider, nick = auth_key.split('_', 2)
    raise ArgumentError.new("pass id in <provider>_<nick> form") if nick.nil?



    user = User.new(options.merge(
      :id => Counter.get_next(self),
      :nick => nick,
      :provider => provider
    ));
    user.save
    user
  end

end
