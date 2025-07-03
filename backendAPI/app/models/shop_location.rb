class ShopLocation < ApplicationRecord
  belongs_to :shop

  validates :name, presence: true
  validates :name, uniqueness: { scope: :shop_id }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true

  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  scope :primary, -> { where(primary: true) }

  before_save :ensure_only_one_primary_per_shop, if: :primary?

  before_validation :set_code, if: -> { code.blank? }

  def display_name
    name
  end

  def full_address
    [address, city, state, postal_code, country].compact.join(', ')
  end

  def contact_info
    [phone, email].compact.join(' | ')
  end

  private

  def ensure_only_one_primary_per_shop
    shop.shop_locations.where.not(id: id).update_all(primary: false) if shop
  end

  def set_code
    last_code = self.class.order(code: :desc).limit(1).pluck(:code).first
    next_number = (last_code.to_i rescue 0) + 1
    self.code = next_number.to_s.rjust(3, '0') # e.g., "001", "002"
  end
end 