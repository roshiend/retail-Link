class Vendor < ApplicationRecord
  belongs_to :shop
  has_many :products, dependent: :nullify

  validates :name, presence: true
  validates :name, uniqueness: { scope: :shop_id }
  validates :contact_email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :website, format: { with: URI::regexp(%w[http https]) }, allow_blank: true

  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }

  def display_name
    name
  end

  def contact_info
    [contact_email, contact_phone].compact.join(' | ')
  end

  before_validation :set_code, if: -> { code.blank? }

  private



  def generate_unique_code
    base = name.downcase.gsub(/[^a-z]/, '') # sanitize: keep a–z only

    max_prefix_length = 3 # because 3 + 3 = 6 max allowed
    (2..[base.length, max_prefix_length].min).each do |prefix_length|
      prefix = base[0, prefix_length]
      code = find_next_available_code(prefix)
      return code if code
    end

    # fallback: generate unique 6-char code
    loop do
      fallback = SecureRandom.alphanumeric(6).downcase
      break fallback unless self.class.exists?(code: fallback)
    end
  end

  def find_next_available_code(prefix)
    return nil if prefix.length > 3 # enforce max length constraint

    (1..999).each do |i|
      suffix = i.to_s.rjust(3, '0')
      candidate = "#{prefix}#{suffix}"
      next if candidate.length > 6
      return candidate unless self.class.exists?(code: candidate)
    end
    nil
  end


end 