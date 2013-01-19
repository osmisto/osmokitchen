
class Counter
  include Ripple::Document

  property :id, String
  key_on :id
  timestamps!

  property :value, Integer, :default => 10

  #
  # Class methods
  #
  def self.get_next(model)
    counter = self.find(model.bucket_name)
    if (!counter)
      counter = self.new({:id => model.bucket_name})
    end

    ret = counter[:value] + 1
    counter[:value] = ret
    counter.save
    ret
  end

end
