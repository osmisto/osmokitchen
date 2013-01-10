require 'active_support/concern'

module OSMS
  module Query
    extend ActiveSupport::Concern

    module ClassMethods
      def query(conditions = {})
        conditions = conditions.select do |key, val|
          self.indexes.keys.include?(key.to_s)
        end

        if conditions.nil? || conditions.empty?
          return self.list
        end

        # expand conditions in case there are array (:key => [:val1, :val2])
        steps = conditions.keys.inject([]) do |res, key|
          if conditions[key].is_a?(Array)
            conditions[key].each {|value| res.push([key, value])}
          else
            res.push([key, conditions[key]])
          end
          res
        end

        # collect keys by appliying each step, and intersecting result with previous
        result_keys = steps.inject(nil) do |result, pair|
          index_name, value = pair
          idx = self.indexes[index_name]
          raise ArgumentError, t('index_undefined', :property => index_name, :type => self.name) if idx.nil?
          keys = Ripple.client.get_index(self.bucket.name, idx.index_key, value)
          result = result.nil? ? Set.new(keys) : result.intersection(keys)
        end

        # collect objects
        self.find(result_keys.to_a)
      end


      def ordered_query(options = {})
        order_by = options.delete(:order_by) || :id
        order_asc = options.delete(:order_asc)

        collection = self.query(options).sort_by do |el|
          [el[order_by], el[:id].to_i]
        end

        order_asc ? collection : collection.reverse
      end
    end
  end
end
