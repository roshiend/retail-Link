class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  has_many :memberships, dependent: :destroy
  has_many :shops, through: :memberships

  validates :full_name, presence: true

  def owned_shops
    shops.joins(:memberships).where(memberships: { role: 'owner' })
  end

  def staff_shops
    shops.joins(:memberships).where(memberships: { role: 'staff' })
  end

  def generate_jwt
    JWT.encode(
      {
        id: id,
        exp: 24.hours.from_now.to_i
      },
      Rails.application.credentials.devise_jwt_secret_key!
    )
  end
end 