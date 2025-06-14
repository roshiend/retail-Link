class Product < ApplicationRecord
  belongs_to :shop

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :sku, presence: true, uniqueness: { scope: :shop_id }
  
  before_validation :generate_sku, on: :create

  private

  def generate_sku
    return if sku.present?
    base = name.parameterize.upcase
    self.sku = base
    counter = 1
    while shop.products.exists?(sku: self.sku)
      self.sku = "#{base}-#{counter}"
      counter += 1
    end
  end
end 