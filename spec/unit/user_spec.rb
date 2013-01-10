require 'spec_helper'

describe User do
  before do
    @member = User.new
  end

  it "should check member's access correctly" do
    @member.role.should be == 'member'
    @member.can('member').should be == true
    @member.can('root').should be == false
  end

  it "should raise ArgumentError on wrong role" do
    expect { @member.can!('lalala')}.to raise_error(ArgumentError)
  end

  it "should raise errors on can! without enought access" do
    expect { @member.can!('root') }.to raise_error(RuntimeError)
  end
end
