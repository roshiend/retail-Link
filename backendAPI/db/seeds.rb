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

# # Get the shop from command line argument or use the first shop
# shop_id = ARGV[0]
# if shop_id
#   shop = Shop.find(shop_id)
#   puts "✅ Using existing shop: #{shop.name} (ID: #{shop.id})"
# else
#   shop = Shop.first
#   if shop
#     puts "✅ Using first available shop: #{shop.name} (ID: #{shop.id})"
#   else
#     puts "❌ No shop found. Please create a shop first or provide a shop ID as argument."
#     puts "Usage: rails db:seed [shop_id]"
#     exit 1
#   end
# end

# Create Option Type Sets (from option_type_sets_template.csv)
option_type_sets_data = [
  { name: "Size", code: "001", description: "Product size variations (S, M, L, XL)", active: true },
  { name: "Color", code: "002", description: "Product color options", active: true },
  { name: "Material", code: "003", description: "Product material variations", active: true },
  { name: "Flavor", code: "004", description: "Food and beverage flavor options", active: true },
  { name: "Gender", code: "005", description: "Gender-specific product options", active: true },
  { name: "Style", code: "006", description: "Product style variations", active: true },
  { name: "Weight", code: "007", description: "Product weight options", active: true },
  { name: "Length", code: "008", description: "Product length variations", active: true },
  { name: "Width", code: "009", description: "Product width options", active: true },
  { name: "Height", code: "010", description: "Product height variations", active: true }
]

option_type_sets_data.each do |data|
  OptionTypeSet.find_or_create_by!(shop: shop, name: data[:name]) do |ots|
    ots.code = data[:code]
    ots.description = data[:description]
    ots.active = data[:active]
  end
end

puts "✅ Created #{option_type_sets_data.length} option type sets"

# Create Product Types (from product_types_template.csv)
product_types_data = [
  { name: "Electronics", code: "001", description: "Electronic devices and gadgets", active: true },
  { name: "Clothing", code: "002", description: "Apparel and fashion items", active: true },
  { name: "Home & Garden", code: "003", description: "Home improvement and garden products", active: true },
  { name: "Sports & Outdoors", code: "004", description: "Sports equipment and outdoor gear", active: true },
  { name: "Books & Media", code: "005", description: "Books, movies, and digital media", active: true },
  { name: "Automotive", code: "006", description: "Vehicle parts and accessories", active: true },
  { name: "Health & Beauty", code: "007", description: "Health and beauty products", active: true },
  { name: "Toys & Games", code: "008", description: "Toys, games, and entertainment", active: true },
  { name: "Food & Beverages", code: "009", description: "Food and drink products", active: true },
  { name: "Jewelry & Watches", code: "010", description: "Fine jewelry and timepieces", active: true }
]

product_types_data.each do |data|
  ProductType.find_or_create_by!(shop: shop, name: data[:name]) do |pt|
    pt.code = data[:code]
    pt.description = data[:description]
    pt.active = data[:active]
  end
end

puts "✅ Created #{product_types_data.length} product types"

# Create Vendors (from vendors_template.csv)
vendors_data = [
  { name: "TechCorp Industries", code: "001", description: "Leading electronics manufacturer", contact_email: "contact@techcorp.com", contact_phone: "+1-555-0101", website: "https://techcorp.com", active: true },
  { name: "Fashion Forward Ltd", code: "002", description: "Premium clothing supplier", contact_email: "sales@fashionforward.com", contact_phone: "+1-555-0102", website: "https://fashionforward.com", active: true },
  { name: "Home Essentials Co", code: "003", description: "Home and garden products", contact_email: "info@homeessentials.com", contact_phone: "+1-555-0103", website: "https://homeessentials.com", active: true },
  { name: "Sports Gear Pro", code: "004", description: "Sports equipment manufacturer", contact_email: "orders@sportsgearpro.com", contact_phone: "+1-555-0104", website: "https://sportsgearpro.com", active: true },
  { name: "Media World Inc", code: "005", description: "Books and media distributor", contact_email: "contact@mediaworld.com", contact_phone: "+1-555-0105", website: "https://mediaworld.com", active: true },
  { name: "Auto Parts Plus", code: "006", description: "Automotive parts supplier", contact_email: "sales@autopartsplus.com", contact_phone: "+1-555-0106", website: "https://autopartsplus.com", active: true },
  { name: "Beauty Supply Co", code: "007", description: "Health and beauty products", contact_email: "orders@beautysupply.com", contact_phone: "+1-555-0107", website: "https://beautysupply.com", active: true },
  { name: "Toy Factory Ltd", code: "008", description: "Toys and games manufacturer", contact_email: "info@toyfactory.com", contact_phone: "+1-555-0108", website: "https://toyfactory.com", active: true },
  { name: "Fresh Foods Inc", code: "009", description: "Food and beverage supplier", contact_email: "contact@freshfoods.com", contact_phone: "+1-555-0109", website: "https://freshfoods.com", active: true },
  { name: "Luxury Jewelers", code: "010", description: "Fine jewelry manufacturer", contact_email: "sales@luxuryjewelers.com", contact_phone: "+1-555-0110", website: "https://luxuryjewelers.com", active: true }
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

# Create Listing Types (from listing_types_template.csv)
listing_types_data = [
  { name: "Physical Product", code: "001", description: "Tangible items that require shipping", active: true },
  { name: "Digital Download", code: "002", description: "Digital products for immediate download", active: true },
  { name: "Service", code: "003", description: "Professional services and consultations", active: true },
  { name: "Subscription", code: "004", description: "Recurring subscription products", active: true },
  { name: "Rental", code: "005", description: "Items available for rent", active: true },
  { name: "Event Ticket", code: "006", description: "Tickets for events and experiences", active: true },
  { name: "Gift Card", code: "007", description: "Digital and physical gift cards", active: true },
  { name: "Membership", code: "008", description: "Membership and access products", active: true },
  { name: "Course", code: "009", description: "Educational courses and training", active: true },
  { name: "Consultation", code: "010", description: "Professional consultation services", active: true }
]

listing_types_data.each do |data|
  ListingType.find_or_create_by!(shop: shop, name: data[:name]) do |lt|
    lt.code = data[:code]
    lt.description = data[:description]
    lt.active = data[:active]
  end
end

puts "✅ Created #{listing_types_data.length} listing types"

# Create Shop Locations (from shop_locations_template.csv)
shop_locations_data = [
  { name: "Main Store", code: "001", description: "Primary retail location", address: "123 Main Street", city: "New York", state: "NY", postal_code: "10001", country: "USA", phone: "+1-555-0201", email: "main@shop.com", active: true, primary: true },
  { name: "Downtown Branch", code: "002", description: "Downtown retail location", address: "456 Broadway", city: "New York", state: "NY", postal_code: "10002", country: "USA", phone: "+1-555-0202", email: "downtown@shop.com", active: true, primary: false },
  { name: "Warehouse", code: "003", description: "Main distribution center", address: "789 Industrial Ave", city: "Brooklyn", state: "NY", postal_code: "11201", country: "USA", phone: "+1-555-0203", email: "warehouse@shop.com", active: true, primary: false },
  { name: "West Coast Store", code: "004", description: "West Coast retail location", address: "321 Sunset Blvd", city: "Los Angeles", state: "CA", postal_code: "90210", country: "USA", phone: "+1-555-0204", email: "westcoast@shop.com", active: true, primary: false },
  { name: "Online Fulfillment", code: "005", description: "Online order fulfillment center", address: "654 E-commerce Dr", city: "San Francisco", state: "CA", postal_code: "94105", country: "USA", phone: "+1-555-0205", email: "online@shop.com", active: true, primary: false },
  { name: "Chicago Branch", code: "006", description: "Midwest retail location", address: "987 Michigan Ave", city: "Chicago", state: "IL", postal_code: "60601", country: "USA", phone: "+1-555-0206", email: "chicago@shop.com", active: true, primary: false },
  { name: "Miami Store", code: "007", description: "Southeast retail location", address: "147 Ocean Dr", city: "Miami", state: "FL", postal_code: "33139", country: "USA", phone: "+1-555-0207", email: "miami@shop.com", active: true, primary: false },
  { name: "Seattle Branch", code: "008", description: "Pacific Northwest location", address: "258 Pike St", city: "Seattle", state: "WA", postal_code: "98101", country: "USA", phone: "+1-555-0208", email: "seattle@shop.com", active: true, primary: false },
  { name: "Austin Store", code: "009", description: "Texas retail location", address: "369 Congress Ave", city: "Austin", state: "TX", postal_code: "78701", country: "USA", phone: "+1-555-0209", email: "austin@shop.com", active: true, primary: false },
  { name: "Denver Branch", code: "010", description: "Rocky Mountain location", address: "741 16th St", city: "Denver", state: "CO", postal_code: "80202", country: "USA", phone: "+1-555-0210", email: "denver@shop.com", active: true, primary: false }
]

shop_locations_data.each do |data|
  ShopLocation.find_or_create_by!(shop: shop, name: data[:name]) do |sl|
    sl.code = data[:code]
    sl.description = data[:description]
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

# Create Categories and Subcategories (from categories_template.csv)
categories_data = [
  {
    name: "Electronics", code: "001", description: "Electronic devices and gadgets", active: true,
    subcategories: [
      { name: "Smartphones", code: "001", description: "Mobile phones and smartphones", active: true },
      { name: "Laptops", code: "002", description: "Portable computers and laptops", active: true },
      { name: "Tablets", code: "003", description: "Tablet computers and iPads", active: true }
    ]
  },
  {
    name: "Clothing & Apparel", code: "002", description: "All types of clothing and fashion items", active: true,
    subcategories: [
      { name: "Men's Clothing", code: "001", description: "Clothing for men", active: true },
      { name: "Women's Clothing", code: "002", description: "Clothing for women", active: true },
      { name: "Kids' Clothing", code: "003", description: "Clothing for children", active: true }
    ]
  },
  {
    name: "Home & Garden", code: "003", description: "Home improvement and garden products", active: true,
    subcategories: [
      { name: "Furniture", code: "001", description: "Home and office furniture", active: true },
      { name: "Garden Tools", code: "002", description: "Gardening equipment and tools", active: true },
      { name: "Kitchen Appliances", code: "003", description: "Cooking and kitchen equipment", active: true }
    ]
  },
  {
    name: "Sports & Fitness", code: "004", description: "Sports equipment and fitness gear", active: true,
    subcategories: [
      { name: "Team Sports", code: "001", description: "Sports equipment for team games", active: true },
      { name: "Fitness Equipment", code: "002", description: "Exercise and fitness machines", active: true }
    ]
  },
  {
    name: "Books & Education", code: "005", description: "Books, educational materials, and courses", active: true,
    subcategories: [
      { name: "Fiction Books", code: "001", description: "Novels and fiction literature", active: true },
      { name: "Non-Fiction Books", code: "002", description: "Educational and reference books", active: true }
    ]
  },
  {
    name: "Automotive", code: "006", description: "Vehicle parts, accessories, and services", active: true,
    subcategories: [
      { name: "Car Parts", code: "001", description: "Automotive parts and components", active: true },
      { name: "Car Accessories", code: "002", description: "Vehicle accessories and add-ons", active: true }
    ]
  },
  {
    name: "Health & Beauty", code: "007", description: "Health products and beauty supplies", active: true,
    subcategories: [
      { name: "Skincare", code: "001", description: "Skin care products and treatments", active: true },
      { name: "Cosmetics", code: "002", description: "Makeup and beauty products", active: true }
    ]
  },
  {
    name: "Toys & Entertainment", code: "008", description: "Toys, games, and entertainment products", active: true,
    subcategories: [
      { name: "Board Games", code: "001", description: "Traditional and modern board games", active: true },
      { name: "Video Games", code: "002", description: "Digital games and gaming accessories", active: true }
    ]
  },
  {
    name: "Food & Beverages", code: "009", description: "Food, drinks, and consumables", active: true,
    subcategories: [
      { name: "Snacks", code: "001", description: "Processed snacks and treats", active: true },
      { name: "Beverages", code: "002", description: "Drinks and liquid refreshments", active: true }
    ]
  },
  {
    name: "Jewelry & Accessories", code: "010", description: "Fine jewelry, watches, and accessories", active: true,
    subcategories: [
      { name: "Necklaces", code: "001", description: "Jewelry for the neck area", active: true },
      { name: "Watches", code: "002", description: "Timepieces and wristwatches", active: true }
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
puts ""
puts "🚀 You can now create products with all the necessary reference data!"
