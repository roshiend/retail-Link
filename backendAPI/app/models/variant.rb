class Variant < ApplicationRecord
  belongs_to :product

  validates :sku, presence: true, uniqueness: { scope: :product_id }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :quantity, numericality: { greater_than_or_equal_to: 0 }

  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  scope :ordered, -> { order(:position) }

  before_save :set_position, if: :new_record?

  def display_name
    options = [option1, option2, option3].compact
    if options.any?
      options.join(' / ')
    else
      product.name
    end
  end

  def options_hash
    {
      option1: option1,
      option2: option2,
      option3: option3
    }.compact
  end

  def has_options?
    [option1, option2, option3].any?(&:present?)
  end

  def inventory_available?
    quantity > 0
  end

  def low_stock?
    quantity > 0 && quantity < 10
  end

  def out_of_stock?
    quantity == 0
  end

  private

  def set_position
    return if position > 0
    max_position = product.variants.maximum(:position) || 0
    self.position = max_position + 1
  end
end 