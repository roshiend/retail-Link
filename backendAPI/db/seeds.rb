# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

puts "🌱 Starting seed data creation..."

# Get the shop from command line argument or use the first shop
shop_id = ARGV[0]
if shop_id
  shop = Shop.find(shop_id)
  puts "✅ Using existing shop: #{shop.name} (ID: #{shop.id})"
else
  shop = Shop.first
  if shop
    puts "✅ Using first available shop: #{shop.name} (ID: #{shop.id})"
  else
    puts "❌ No shop found. Please create a shop first or provide a shop ID as argument."
    puts "Usage: rails db:seed [shop_id]"
    exit 1
  end
end

# Create Option Type Sets
option_type_sets_data = [
  {
    name: "Color",
    code: "001",
    #description: "Product color variations",
    active: true
  },
  {
    name: "Size",
    code: "002",
    #description: "Product size variations",
    active: true
  },
  {
    name: "Material",
    code: "003",
   # description: "Product material variations",
    active: true
  },
  {
    name: "Flavor",
    code: "004",
    #description: "Product flavor variations",
    active: true
  },
  {
    name: "Gender",
    code: "005",
    #description: "Product gender-specific variations",
    active: true
  },
  {
    name: "Style",
    code: "006",
    #description: "Product style variations",
    active: true
  },
  {
    name: "Pattern",
    code: "007",
    #description: "Product pattern variations",
    active: true
  },
  {
    name: "Fit",
    code: "008",
    #description: "Product fit variations",
    active: true
  }
]

option_type_sets_data.each do |data|
  OptionTypeSet.find_or_create_by!(shop: shop, name: data[:name]) do |ots|
    ots.code = data[:code]
    ots.active = data[:active]
  end
end

puts "✅ Created #{option_type_sets_data.length} option type sets"

# Create Product Types
product_types_data = [
  {
    name: "Clothing",
    code: "001",
   # description: "Apparel and fashion items",
    active: true
  },
  {
    name: "Electronics",
    code: "002",
    #description: "Electronic devices and accessories",
    active: true
  },
  {
    name: "Home & Garden",
    code: "003",
    #description: "Home improvement and garden items",
    active: true
  },
  {
    name: "Sports & Outdoors",
    code: "004",
    #description: "Sports equipment and outdoor gear",
    active: true
  },
  {
    name: "Beauty & Personal Care",
    code: "005",
   # description: "Beauty products and personal care items",
    active: true
  },
  {
    name: "Books & Media",
    code: "006",
   # description: "Books, movies, and media content",
    active: true
  },
  {
    name: "Toys & Games",
    code: "007",
    description: "Toys, games, and entertainment items",
    active: true
  },
  {
    name: "Food & Beverages",
    code: "008",
   # description: "Food items and beverages",
    active: true
  }
]

product_types_data.each do |data|
  ProductType.find_or_create_by!(shop: shop, name: data[:name]) do |pt|
    pt.code = data[:code]
    pt.active = data[:active]
  end
end

puts "✅ Created #{product_types_data.length} product types"

# Create Vendors
vendors_data = [
  {
    name: "Nike",
    code: "001",
    description: "Leading sports apparel and footwear manufacturer",
    contact_email: "orders@nike.com",
    contact_phone: "+1-800-344-6453",
    website: "https://www.nike.com",
    active: true
  },
  {
    name: "Apple",
    code: "002",
    description: "Technology company specializing in consumer electronics",
    contact_email: "business@apple.com",
    contact_phone: "+1-800-275-2273",
    website: "https://www.apple.com",
    active: true
  },
  {
    name: "Samsung",
    code: "003",
    description: "Electronics and technology company",
    contact_email: "business@samsung.com",
    contact_phone: "+1-800-726-7864",
    website: "https://www.samsung.com",
    active: true
  },
  {
    name: "Adidas",
    code: "004",
    description: "German sportswear manufacturer",
    contact_email: "orders@adidas.com",
    contact_phone: "+1-800-982-9337",
    website: "https://www.adidas.com",
    active: true
  },
  {
    name: "Sony",
    code: "005",
    description: "Japanese multinational conglomerate",
    contact_email: "business@sony.com",
    contact_phone: "+1-800-222-7669",
    website: "https://www.sony.com",
    active: true
  },
  {
    name: "Local Supplier",
    code: "006",
    description: "Local business supplier",
    contact_email: "info@localsupplier.com",
    contact_phone: "+1-555-0123",
    website: "https://www.localsupplier.com",
    active: true
  }
]

vendors_data.each do |data|
  Vendor.find_or_create_by!(shop: shop, name: data[:name]) do |v|
    v.code = data[:code]
    v.description = data[:description]
    v.contact_email = data[:contact_email]
    v.contact_phone = data[:contact_phone]
    v.website = data[:website]
    v.active = data[:active]
  end
end

puts "✅ Created #{vendors_data.length} vendors"

# Create Listing Types
listing_types_data = [
  {
    name: "Physical Product",
    code: "001",
    description: "Tangible items that require shipping",
    active: true
  },
  {
    name: "Digital Product",
    code: "002",
    description: "Digital downloads and online content",
    active: true
  },
  {
    name: "Service",
    code: "003",
    description: "Professional services and consultations",
    active: true
  },
  {
    name: "Subscription",
    code: "004",
    description: "Recurring subscription products",
    active: true
  },
  {
    name: "Event",
    code: "005",
    description: "Event tickets and registrations",
    active: true
  },
  {
    name: "Rental",
    code: "006",
    description: "Rental and lease products",
    active: true
  }
]

listing_types_data.each do |data|
  ListingType.find_or_create_by!(shop: shop, name: data[:name]) do |lt|
    lt.code = data[:code]
    lt.description = data[:description]
    lt.active = data[:active]
  end
end

puts "✅ Created #{listing_types_data.length} listing types"

# Create Shop Locations
shop_locations_data = [
  {
    name: "Main Store",
    code: "001",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    postal_code: "10001",
    country: "USA",
    phone: "+1-555-0123",
    email: "main@samplestore.com",
    active: true,
    primary: true
  },
  {
    name: "Downtown Location",
    code: "002",
    address: "456 Downtown Ave",
    city: "New York",
    state: "NY",
    postal_code: "10002",
    country: "USA",
    phone: "+1-555-0124",
    email: "downtown@samplestore.com",
    active: true,
    primary: false
  },
  {
    name: "Warehouse",
    code: "003",
    address: "789 Industrial Blvd",
    city: "Brooklyn",
    state: "NY",
    postal_code: "11201",
    country: "USA",
    phone: "+1-555-0125",
    email: "warehouse@samplestore.com",
    active: true,
    primary: false
  },
  {
    name: "Online Store",
    code: "004",
    address: nil,
    city: nil,
    state: nil,
    postal_code: nil,
    country: "USA",
    phone: "+1-555-0126",
    email: "online@samplestore.com",
    active: true,
    primary: false
  }
]

shop_locations_data.each do |data|
  ShopLocation.find_or_create_by!(shop: shop, name: data[:name]) do |sl|
    sl.code = data[:code]
    sl.address = data[:address]
    sl.city = data[:city]
    sl.state = data[:state]
    sl.postal_code = data[:postal_code]
    sl.country = data[:country]
    sl.phone = data[:phone]
    sl.email = data[:email]
    sl.active = data[:active]
    sl.primary = data[:primary]
  end
end

puts "✅ Created #{shop_locations_data.length} shop locations"

# Create Categories and Subcategories
categories_data = [
  {
    name: "Clothing",
    code: "001",
    description: "Apparel and fashion items",
    active: true,
    subcategories: [
      { name: "Men's Clothing", code: "001", description: "Clothing for men", active: true },
      { name: "Women's Clothing", code: "002", description: "Clothing for women", active: true },
      { name: "Kids' Clothing", code: "003", description: "Clothing for children", active: true },
      { name: "Accessories", code: "004", description: "Fashion accessories", active: true },
      { name: "Shoes", code: "005", description: "Footwear", active: true }
    ]
  },
  {
    name: "Electronics",
    code: "002",
    description: "Electronic devices and accessories",
    active: true,
    subcategories: [
      { name: "Computers", code: "001", description: "Desktop and laptop computers", active: true },
      { name: "Mobile Devices", code: "002", description: "Smartphones and tablets", active: true },
      { name: "Audio", code: "003", description: "Speakers, headphones, and audio equipment", active: true },
      { name: "Gaming", code: "004", description: "Video games and gaming accessories", active: true },
      { name: "Cameras", code: "005", description: "Digital cameras and photography equipment", active: true }
    ]
  },
  {
    name: "Home & Garden",
    code: "003",
    description: "Home improvement and garden items",
    active: true,
    subcategories: [
      { name: "Furniture", code: "001", description: "Home and office furniture", active: true },
      { name: "Kitchen & Dining", code: "002", description: "Kitchen appliances and dining items", active: true },
      { name: "Garden Tools", code: "003", description: "Gardening equipment and tools", active: true },
      { name: "Home Decor", code: "004", description: "Decorative items for the home", active: true },
      { name: "Lighting", code: "005", description: "Lighting fixtures and lamps", active: true }
    ]
  },
  {
    name: "Sports & Outdoors",
    code: "004",
    description: "Sports equipment and outdoor gear",
    active: true,
    subcategories: [
      { name: "Fitness", code: "001", description: "Exercise equipment and fitness gear", active: true },
      { name: "Team Sports", code: "002", description: "Equipment for team sports", active: true },
      { name: "Outdoor Recreation", code: "003", description: "Camping and outdoor equipment", active: true },
      { name: "Water Sports", code: "004", description: "Swimming and water sports equipment", active: true },
      { name: "Winter Sports", code: "005", description: "Skiing and snowboarding equipment", active: true }
    ]
  },
  {
    name: "Beauty & Personal Care",
    code: "005",
    description: "Beauty products and personal care items",
    active: true,
    subcategories: [
      { name: "Skincare", code: "001", description: "Facial and body skincare products", active: true },
      { name: "Makeup", code: "002", description: "Cosmetics and makeup products", active: true },
      { name: "Hair Care", code: "003", description: "Hair styling and care products", active: true },
      { name: "Fragrances", code: "004", description: "Perfumes and colognes", active: true },
      { name: "Personal Hygiene", code: "005", description: "Personal care and hygiene products", active: true }
    ]
  },
  {
    name: "Books & Media",
    code: "006",
    description: "Books, movies, and media content",
    active: true,
    subcategories: [
      { name: "Books", code: "001", description: "Fiction and non-fiction books", active: true },
      { name: "Movies & TV", code: "002", description: "DVDs and streaming content", active: true },
      { name: "Music", code: "003", description: "CDs and digital music", active: true },
      { name: "Magazines", code: "004", description: "Print and digital magazines", active: true },
      { name: "Educational", code: "005", description: "Educational materials and courses", active: true }
    ]
  }
]

categories_data.each do |category_data|
  category = Category.find_or_create_by!(shop: shop, name: category_data[:name]) do |c|
    c.code = category_data[:code]
    c.description = category_data[:description]
    c.active = category_data[:active]
  end

  category_data[:subcategories].each do |subcategory_data|
    Subcategory.find_or_create_by!(shop: shop, category: category, name: subcategory_data[:name]) do |sc|
      sc.code = subcategory_data[:code]
      sc.description = subcategory_data[:description]
      sc.active = subcategory_data[:active]
    end
  end
end

puts "✅ Created #{categories_data.length} categories with subcategories"

puts "🎉 Seed data creation completed successfully!"
puts "📊 Summary:"
puts "   - Shop: 1"
puts "   - Option Type Sets: #{option_type_sets_data.length}"
puts "   - Product Types: #{product_types_data.length}"
puts "   - Vendors: #{vendors_data.length}"
puts "   - Listing Types: #{listing_types_data.length}"
puts "   - Shop Locations: #{shop_locations_data.length}"
puts "   - Categories: #{categories_data.length}"
puts "   - Subcategories: #{categories_data.sum { |c| c[:subcategories].length }}"
