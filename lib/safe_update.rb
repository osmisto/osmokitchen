require 'active_support/concern'

module OSMS
  module SafeUpdate
    extend ActiveSupport::Concern


    def safe_update(values)
      safe_to_update = values.select do |key, value|
        self.class.are_safe[key]
      end
      self.attributes = safe_to_update
    end

    def logged_update(author, values)
      res = safe_update(values)
      return res unless res
      return res if self.changelog.nil?
      return res if self.changed.empty?

      self.changelog << ChangeEntry.create_new(:update, author, self)
      return res
    end

    module ClassMethods
      def are_safe(*list)
        @are_safe ||= {}.with_indifferent_access
        hash = Hash[list.map {|el| [el, true]}]
        @are_safe.update(hash)
      end
    end
  end
end
