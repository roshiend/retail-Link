class Product < ApplicationRecord
  belongs_to :shop
  belongs_to :vendor, optional: true
  belongs_to :product_type, optional: true
  belongs_to :listing_type, optional: true
  belongs_to :category, optional: true
  belongs_to :subcategory, optional: true
  belongs_to :shop_location, optional: true
  has_many :option_types, dependent: :destroy
  has_many :variants, dependent: :destroy, inverse_of: :product

  accepts_nested_attributes_for :option_types, allow_destroy: true, reject_if: :all_blank
  accepts_nested_attributes_for :variants, allow_destroy: true, reject_if: :all_blank

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :sku, presence: true, uniqueness: { scope: :shop_id }
  validate :subcategory_belongs_to_category, if: -> { subcategory.present? && category.present? }
  validate :variant_uniqueness
  validate :option_type_consistency
  
  before_validation :generate_sku, on: :create
  after_save :manage_variants_on_option_changes
  after_save :ensure_default_variant

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

  def variants_count
    variants.count
  end

  def has_variants?
    variants.any?
  end

  def default_variant
    variants.ordered.first
  end

  def total_inventory
    variants.sum(:quantity)
  end

  def low_stock_variants
    variants.where('quantity > 0 AND quantity < 10')
  end

  def out_of_stock_variants
    variants.where(quantity: 0)
  end

  # Shopify-like method to get all possible option combinations
  def option_combinations
    return [] if option_types.empty?
    
    option_values = option_types.map(&:values)
    option_values.first.product(*option_values[1..-1])
  end

  # Shopify-like method to find variant by option combination
  def find_variant_by_options(option_values)
    variants.find do |variant|
      option_values.each_with_index.all? do |value, index|
        variant.send("option#{index + 1}") == value
      end
    end
  end

  # Shopify-like method to create missing variants
  def create_missing_variants
    return if option_types.empty?
    
    option_combinations.each do |combination|
      next if find_variant_by_options(combination)
      
      # Create new variant for this combination
      variant_attrs = {
        price: price,
        quantity: 0,
        active: true
      }
      
      # Set option values
      combination.each_with_index do |value, index|
        variant_attrs["option#{index + 1}"] = value
      end
      
      # Generate SKU
      variant_attrs[:sku] = generate_variant_sku(combination)
      
      variants.create!(variant_attrs)
    end
  end

  # Shopify-like method to remove invalid variants
  def remove_invalid_variants
    return if option_types.empty?
    
    valid_combinations = option_combinations
    
    variants.each do |variant|
      combination = []
      option_types.length.times do |i|
        combination << variant.send("option#{i + 1}")
      end
      
      unless valid_combinations.include?(combination)
        variant.destroy
      end
    end
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

  def generate_variant_sku(combination)
    base_sku = sku
    option_suffix = combination.map { |value| value.parameterize }.join('-')
    
    if option_suffix.present?
      "#{base_sku}-#{option_suffix}"
    else
      base_sku
    end
  end

  def subcategory_belongs_to_category
    Rails.logger.info "Validating subcategory: subcategory_id=#{subcategory&.id}, subcategory.category_id=#{subcategory&.category_id}, category_id=#{category&.id}"
    unless subcategory.category_id == category.id
      errors.add(:subcategory, "must belong to the selected category")
    end
  end

  def variant_uniqueness
    return unless variants.any?
    
    combinations = variants.map do |variant|
      [
        variant.option1,
        variant.option2,
        variant.option3
      ]
    end
    
    if combinations.uniq.length != combinations.length
      errors.add(:variants, "must have unique option combinations")
    end
  end

  def option_type_consistency
    return unless option_types.any?
    return if new_record? # Skip validation during creation
    
    # Check that all variants have the correct number of options
    expected_option_count = option_types.count
    
    variants.each do |variant|
      actual_options = [variant.option1, variant.option2, variant.option3].compact.count
      if actual_options != expected_option_count
        errors.add(:variants, "must have exactly #{expected_option_count} option values")
        break
      end
    end
  end

  def manage_variants_on_option_changes
    Rails.logger.info "Managing variants on option changes for product #{id}"
    return unless option_types.any?
    
    # Only run this if we have option types and they're properly saved
    return unless option_types.all?(&:persisted?)
    
    Rails.logger.info "Option types are persisted, managing variants"
    
    # Remove invalid variants first
    remove_invalid_variants
    
    # Create missing variants
    create_missing_variants
    
    # Update positions
    variants.each_with_index do |variant, index|
      variant.position = index + 1
      variant.save! if variant.changed?
    end
    
    Rails.logger.info "Variant management completed. Total variants: #{variants.count}"
  end

  def ensure_default_variant
    return if variants.any?
    return if option_types.any? # Don't create default variant if we have option types
    
    # Create a default variant if no variants exist and no option types
    variants.create!(
      sku: sku,
      price: price,
      quantity: 0,
      active: true,
      position: 1
    )
  end
end 