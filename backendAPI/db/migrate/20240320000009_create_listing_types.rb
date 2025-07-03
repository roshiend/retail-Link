class CreateListingTypes < ActiveRecord::Migration[8.0]
  def change
    create_table :listing_types do |t|
      t.references :shop, null: false, foreign_key: true
      t.string :name, null: false
      t.string :code
      t.text :description
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :listing_types, [:shop_id, :name], unique: true
  end
end 