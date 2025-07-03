class ProductType < ApplicationRecord
  belongs_to :shop
  has_many :products, dependent: :nullify

  validates :name, presence: true
  validates :name, uniqueness: { scope: :shop_id }

  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }

  before_validation :set_code, if: -> { code.blank? }

  def display_name
    name
  end

  def products_count
    products.count
  end

  private

  def set_code
    last_code = self.class.order(code: :desc).limit(1).pluck(:code).first
    next_number = (last_code.to_i rescue 0) + 1
    self.code = next_number.to_s.rjust(3, '0') # e.g., "001", "002"
  end

end 