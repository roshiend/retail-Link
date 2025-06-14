class Membership < ApplicationRecord
  belongs_to :user
  belongs_to :shop

  validates :role, presence: true, inclusion: { in: %w[owner staff] }
  validates :user_id, uniqueness: { scope: :shop_id }

  scope :owners, -> { where(role: 'owner') }
  scope :staff, -> { where(role: 'staff') }
end 