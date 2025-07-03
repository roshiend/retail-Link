class Subcategory < ApplicationRecord
  belongs_to :shop
  belongs_to :category
  has_many :products, dependent: :nullify

  validates :name, presence: true
  validates :name, uniqueness: { scope: [:shop_id, :category_id] }
  validates :slug, uniqueness: { scope: [:shop_id, :category_id] }, allow_blank: true

  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  scope :for_category, ->(category_id) { where(category_id: category_id) }

  before_validation :generate_slug, on: :create
  before_validation :set_code, if: -> { code.blank? }

  def display_name
    name
  end

  def full_name
    "#{category.name} > #{name}"
  end

  def products_count
    products.count
  end

  private

  def generate_slug
    return if slug.present?
    base = name.parameterize
    self.slug = base
    counter = 1
    while shop.subcategories.where(category: category).exists?(slug: self.slug)
      self.slug = "#{base}-#{counter}"
      counter += 1
    end
  end

  def set_code
    last_code = self.class.order(code: :desc).limit(1).pluck(:code).first
    next_number = (last_code.to_i rescue 0) + 1
    self.code = next_number.to_s.rjust(3, '0') # e.g., "001", "002"
  end
end 