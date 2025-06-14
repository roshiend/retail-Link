class CreateMemberships < ActiveRecord::Migration[8.0]
  def change
    create_table :memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :shop, null: false, foreign_key: true
      t.string :role, null: false, default: 'staff'

      t.timestamps
    end

    add_index :memberships, [:user_id, :shop_id], unique: true
  end
end 