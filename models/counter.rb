
class Counter
  include Ripple::Document

  property :id, String
  property :value, Integer, :default => 0
  timestamps!
  key_on :id

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
