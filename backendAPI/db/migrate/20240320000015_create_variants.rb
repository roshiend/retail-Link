class CreateVariants < ActiveRecord::Migration[8.0]
  def change
    create_table :variants do |t|
      t.references :product, null: false, foreign_key: true
      t.string :sku, null: false
      t.decimal :price, precision: 10, scale: 2, null: false
      t.integer :quantity, default: 0
      t.string :option1
      t.string :option2
      t.string :option3
      t.integer :position, default: 0
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :variants, [:product_id, :sku], unique: true
    add_index :variants, [:product_id, :position]
  end
end 