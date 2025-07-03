class CreateShopLocations < ActiveRecord::Migration[8.0]
  def change
    create_table :shop_locations do |t|
      t.references :shop, null: false, foreign_key: true
      t.string :name, null: false 
      t.string :code
      t.text :description
      t.text :address
      t.string :city
      t.string :state
      t.string :postal_code
      t.string :country
      t.string :phone
      t.string :email
      t.boolean :active, default: true
      t.boolean :primary, default: false  

      t.timestamps
    end

    add_index :shop_locations, [:shop_id, :name], unique: true
  end
end 