class CreateShops < ActiveRecord::Migration[8.0]
  def change
    create_table :shops do |t|
      t.string :name, null: false
      t.string :subdomain, null: false
      t.text :description
      t.string :logo_url
      t.string :domain

      t.timestamps
    end

    add_index :shops, :subdomain, unique: true
    add_index :shops, :domain, unique: true
  end
end 