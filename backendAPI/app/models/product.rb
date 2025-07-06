class Product < ApplicationRecord
  belongs_to :shop
  belongs_to :vendor, optional: true
  belongs_to :product_type, optional: true
  belongs_to :listing_type, optional: true
  belongs_to :category, optional: true
  belongs_to :subcategory, optional: true
  belongs_to :shop_location, optional: true
  has_many :option_types, dependent: :destroy

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :sku, presence: true, uniqueness: { scope: :shop_id }
  validate :subcategory_belongs_to_category, if: -> { subcategory.present? && category.present? }
  
  before_validation :generate_sku, on: :create

  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  scope :by_vendor, ->(vendor_id) { where(vendor_id: vendor_id) }
  scope :by_category, ->(category_id) { where(category_id: category_id) }
  scope :by_subcategory, ->(subcategory_id) { where(subcategory_id: subcategory_id) }
  scope :by_product_type, ->(product_type_id) { where(product_type_id: product_type_id) }
  scope :by_listing_type, ->(listing_type_id) { where(listing_type_id: listing_type_id) }

  def display_name
    name
  end

  def category_path
    if category && subcategory
      "#{category.name} > #{subcategory.name}"
    elsif category
      category.name
    else
      "Uncategorized"
    end
  end

  def active_option_types
    option_types.active
  end

  def option_types_count
    option_types.count
  end

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

  def subcategory_belongs_to_category
    unless subcategory.category_id == category.id
      errors.add(:subcategory, "must belong to the selected category")
    end
  end
end 