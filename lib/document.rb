require 'active_support/concern'
require_relative 'query'
require_relative 'safe_update'

module Ripple
  module Document
    extend ActiveSupport::Concern
    include OSMS::Query
    include OSMS::SafeUpdate
  end
end
