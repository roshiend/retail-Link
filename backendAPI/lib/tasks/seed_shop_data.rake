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
end 