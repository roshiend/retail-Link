class CreateProducts < ActiveRecord::Migration[8.0]
  def change
    create_table :products do |t|
      t.references :shop, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false
      t.string :sku, null: false
      t.integer :stock_quantity, default: 0
      t.string :image_url
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :products, [:shop_id, :sku], unique: true
  end
end 