class CreateSubcategories < ActiveRecord::Migration[8.0]
  def change
    create_table :subcategories do |t|
      t.references :shop, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true
      t.string :name, null: false
      t.string :code
      t.text :description
      t.string :slug
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :subcategories, [:shop_id, :category_id, :name], unique: true
    add_index :subcategories, [:shop_id, :category_id, :slug], unique: true
  end
end 