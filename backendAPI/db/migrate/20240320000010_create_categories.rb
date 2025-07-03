class CreateCategories < ActiveRecord::Migration[8.0]
  def change
    create_table :categories do |t|
      t.references :shop, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description 
      t.string :code
      t.string :slug
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :categories, [:shop_id, :name], unique: true
    add_index :categories, [:shop_id, :slug], unique: true
  end
end 