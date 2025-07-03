class CreateOptionTypes < ActiveRecord::Migration[8.0]
  def change
    create_table :option_types do |t|
      t.references :product, null: false, foreign_key: true
      t.string :name, null: false
      t.string :values, array: true, default: []
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :option_types, [:product_id, :name], unique: true
  end
end 