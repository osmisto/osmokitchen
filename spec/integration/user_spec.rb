require 'spec_helper'

describe "User::ClassMethods", :integration => true do

  it "should get guest on demand" do
    guest = User.get_guest()
    guest.id.nil?.should be == false
    guest.nick.should be == 'guest'
  end

  it "should create new good user on demand" do
    user = User.create_new('test_nick')
    user.id.should be == 'test_nick'
    user.nick.should be == 'nick'
    user.provider.should be == 'test'
    user.role.should be == 'member'
  end

  it "should not create a user without user_id" do
    expect { User.create_new() }.to raise_error(ArgumentError)
  end

  it "should not create a user with unparsable id" do
    expect { User.create_new('test')}.to raise_error(ArgumentError)
  end
end

describe "Guest user", :integration => true do
  before do
    @guest = User.get_guest
  end

  it "should be created with necessary fields" do
    @guest.nick.should be == 'guest'
    @guest.provider.should be == 'osmostarter'
    @guest.role.should be == 'none'
  end

  it "should not allow guest to do anything" do
    @guest.can('none').should be == true
    @guest.can('member').should be == false
  end

  it "should allow member actions if guest is owner" do
    @guest.can('member', @guest.id).should be == true
  end

  it "should return same guest on each call" do
    guest2 = User.get_guest
    @guest.id.should be == guest2.id
  end
end