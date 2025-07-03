class OptionType < ApplicationRecord
  belongs_to :product

  validates :name, presence: true
  validates :name, uniqueness: { scope: :product_id }
  validates :values, presence: true

  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }

  def display_name
    name
  end

  def values_list
    values.join(', ')
  end

  def add_value(value)
    return if value.blank?
    self.values = (values + [value.strip]).uniq
  end

  def remove_value(value)
    self.values = values.reject { |v| v == value }
  end

  def has_value?(value)
    values.include?(value)
  end
end 