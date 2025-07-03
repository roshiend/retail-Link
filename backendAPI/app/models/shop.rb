class Shop < ApplicationRecord
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  has_many :products, dependent: :destroy
  has_many :vendors, dependent: :destroy
  has_many :product_types, dependent: :destroy
  has_many :shop_locations, dependent: :destroy
  has_many :listing_types, dependent: :destroy
  has_many :categories, dependent: :destroy
  has_many :subcategories, dependent: :destroy
  has_many :option_type_sets, dependent: :destroy

  validates :name, presence: true
  validates :subdomain, presence: true, uniqueness: true, format: { with: /\A[a-z0-9-]+\z/, message: "can only contain lowercase letters, numbers, and hyphens" }

  before_validation :generate_subdomain, on: :create

  def primary_location
    shop_locations.primary.first
  end

  def active_categories
    categories.active
  end

  def active_vendors
    vendors.active
  end

  def active_product_types
    product_types.active
  end

  def active_listing_types
    listing_types.active
  end

  def active_option_type_sets
    option_type_sets.active
  end

  private

  def generate_subdomain
    return if subdomain.present?
    base = name.parameterize
    self.subdomain = base
    counter = 1
    while Shop.exists?(subdomain: self.subdomain)
      self.subdomain = "#{base}-#{counter}"
      counter += 1
    end
  end
end 