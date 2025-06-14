class Shop < ApplicationRecord
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  has_many :products, dependent: :destroy

  validates :name, presence: true
  validates :subdomain, presence: true, uniqueness: true, format: { with: /\A[a-z0-9-]+\z/, message: "can only contain lowercase letters, numbers, and hyphens" }

  before_validation :generate_subdomain, on: :create

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