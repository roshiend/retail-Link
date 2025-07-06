class AddReferencesToProducts < ActiveRecord::Migration[8.0]
  def change
    add_reference :products, :vendor, null: true, foreign_key: true
    add_reference :products, :product_type, null: true, foreign_key: true
    add_reference :products, :listing_type, null: true, foreign_key: true
    add_reference :products, :category, null: true, foreign_key: true
    add_reference :products, :subcategory, null: true, foreign_key: true
    add_reference :products, :shop_location, null: true, foreign_key: true
  end
end 