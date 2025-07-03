class CreateOptionTypeSets < ActiveRecord::Migration[8.0]
  def change
    create_table :option_type_sets do |t|
      t.references :shop, null: false, foreign_key: true
      t.string :name, null: false
      t.string :code
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :option_type_sets, [:shop_id, :name], unique: true
  end
end 