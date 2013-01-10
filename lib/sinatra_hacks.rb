
module Sinatra
  class Base
    private

    def self.request_method(*meth)
      condition do
        current = request.request_method.downcase.to_sym
        if meth.respond_to?(:include?) then
          meth.include?(current)
        else
          meth == current
        end
      end
    end
  end
end
