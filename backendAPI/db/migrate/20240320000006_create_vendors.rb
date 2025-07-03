class CreateVendors < ActiveRecord::Migration[8.0]
  def change
    create_table :vendors do |t|
      t.references :shop, null: false, foreign_key: true
      t.string :name, null: false
      t.string :code
      t.text :description
      t.string :contact_email
      t.string :contact_phone
      t.string :website
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :vendors, [:shop_id, :name], unique: true
  end
end 