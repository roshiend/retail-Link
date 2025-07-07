namespace :shop do
  desc "Seed data for a specific shop"
  task :seed_data, [:shop_id] => :environment do |task, args|
    shop_id = args[:shop_id]
    
    if shop_id.blank?
      puts "❌ Please provide a shop ID"
      puts "Usage: rails shop:seed_data[shop_id]"
      exit 1
    end
    
    begin
      shop = Shop.find(shop_id)
      puts "✅ Found shop: #{shop.name} (ID: #{shop.id})"
      
      # Load and run the seed file
      load Rails.root.join('db', 'seeds.rb')
      
      puts "🎉 Seed data created successfully for shop: #{shop.name}"
    rescue ActiveRecord::RecordNotFound
      puts "❌ Shop with ID #{shop_id} not found"
      exit 1
    end
  end
  
  desc "List all shops"
  task list: :environment do
    shops = Shop.all
    if shops.any?
      puts "📋 Available shops:"
      shops.each do |shop|
        puts "  ID: #{shop.id} | Name: #{shop.name} | Subdomain: #{shop.subdomain}"
      end
    else
      puts "❌ No shops found"
    end
  end
  
  desc "Seed sample products with variants for a shop"
  task seed_products: :environment do
    shop_id = ENV['SHOP_ID']
    
    if shop_id.blank?
      puts "❌ Please provide a SHOP_ID environment variable"
      puts "Usage: rake shop:seed_products SHOP_ID=1"
      exit 1
    end
    
    shop = Shop.find(shop_id)
    puts "🌱 Seeding sample products for shop: #{shop.name} (ID: #{shop.id})"
    
    # Get reference data
    clothing_category = shop.categories.find_by(name: "Clothing & Apparel")
    mens_subcategory = clothing_category&.subcategories&.find_by(name: "Men's Clothing")
    fashion_vendor = shop.vendors.find_by(name: "Fashion Forward Ltd")
    clothing_product_type = shop.product_types.find_by(name: "Clothing")
    physical_listing_type = shop.listing_types.find_by(name: "Physical Product")
    main_location = shop.shop_locations.find_by(name: "Main Store")
    
    # Sample Product 1: T-Shirt with Color and Size variants
    tshirt = shop.products.create!(
      name: "Premium Cotton T-Shirt",
      description: "High-quality cotton t-shirt available in multiple colors and sizes",
      price: 25.00,
      sku: "TSH001",
      vendor: fashion_vendor,
      product_type: clothing_product_type,
      listing_type: physical_listing_type,
      category: clothing_category,
      subcategory: mens_subcategory,
      shop_location: main_location,
      active: true
    )
    
    # Create option types for T-Shirt
    color_option = tshirt.option_types.create!(
      name: "Color",
      values: ["Red", "Blue", "Green", "Black", "White"],
      position: 1,
      active: true
    )
    
    size_option = tshirt.option_types.create!(
      name: "Size",
      values: ["S", "M", "L", "XL", "XXL"],
      position: 2,
      active: true
    )
    
    # Create variants for T-Shirt
    color_option.values.each do |color|
      size_option.values.each do |size|
        tshirt.variants.create!(
          sku: "TSH001-#{color.downcase}-#{size.downcase}",
          price: 25.00,
          quantity: rand(10..50),
          option1: color,
          option2: size,
          position: tshirt.variants.count + 1,
          active: true
        )
      end
    end
    
    puts "✅ Created T-Shirt product with #{tshirt.variants.count} variants"
    
    # Sample Product 2: Smartphone with Storage variants
    electronics_category = shop.categories.find_by(name: "Electronics")
    smartphones_subcategory = electronics_category&.subcategories&.find_by(name: "Smartphones")
    tech_vendor = shop.vendors.find_by(name: "TechCorp Industries")
    electronics_product_type = shop.product_types.find_by(name: "Electronics")
    
    smartphone = shop.products.create!(
      name: "SmartPhone Pro",
      description: "Latest smartphone with advanced features and multiple storage options",
      price: 799.00,
      sku: "PHN001",
      vendor: tech_vendor,
      product_type: electronics_product_type,
      listing_type: physical_listing_type,
      category: electronics_category,
      subcategory: smartphones_subcategory,
      shop_location: main_location,
      active: true
    )
    
    # Create option types for Smartphone
    storage_option = smartphone.option_types.create!(
      name: "Storage",
      values: ["64GB", "128GB", "256GB", "512GB"],
      position: 1,
      active: true
    )
    
    color_option = smartphone.option_types.create!(
      name: "Color",
      values: ["Black", "White", "Gold", "Silver"],
      position: 2,
      active: true
    )
    
    # Create variants for Smartphone with different prices based on storage
    storage_prices = { "64GB" => 799.00, "128GB" => 899.00, "256GB" => 1099.00, "512GB" => 1299.00 }
    
    storage_option.values.each do |storage|
      color_option.values.each do |color|
        smartphone.variants.create!(
          sku: "PHN001-#{storage.downcase}-#{color.downcase}",
          price: storage_prices[storage],
          quantity: rand(5..20),
          option1: storage,
          option2: color,
          position: smartphone.variants.count + 1,
          active: true
        )
      end
    end
    
    puts "✅ Created Smartphone product with #{smartphone.variants.count} variants"
    
    # Sample Product 3: Simple product without variants
    home_category = shop.categories.find_by(name: "Home & Garden")
    furniture_subcategory = home_category&.subcategories&.find_by(name: "Furniture")
    home_vendor = shop.vendors.find_by(name: "Home Essentials Co")
    home_product_type = shop.product_types.find_by(name: "Home & Garden")
    
    chair = shop.products.create!(
      name: "Ergonomic Office Chair",
      description: "Comfortable office chair with adjustable features",
      price: 299.00,
      sku: "CHR001",
      vendor: home_vendor,
      product_type: home_product_type,
      listing_type: physical_listing_type,
      category: home_category,
      subcategory: furniture_subcategory,
      shop_location: main_location,
      active: true
    )
    
    # Create single variant for simple product
    chair.variants.create!(
      sku: "CHR001",
      price: 299.00,
      quantity: 15,
      position: 1,
      active: true
    )
    
    puts "✅ Created Office Chair product (simple product without variants)"
    
    puts "🎉 Sample products created successfully!"
    puts "📊 Summary:"
    puts "   - T-Shirt: #{tshirt.variants.count} variants (Color × Size)"
    puts "   - Smartphone: #{smartphone.variants.count} variants (Storage × Color)"
    puts "   - Office Chair: 1 variant (simple product)"
    puts ""
    puts "🚀 You can now test the Shopify-like variant management system!"
  end
end 