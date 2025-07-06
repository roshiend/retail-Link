# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2024_03_20_000014) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "categories", force: :cascade do |t|
    t.bigint "shop_id", null: false
    t.string "name", null: false
    t.text "description"
    t.string "code"
    t.string "slug"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id", "name"], name: "index_categories_on_shop_id_and_name", unique: true
    t.index ["shop_id", "slug"], name: "index_categories_on_shop_id_and_slug", unique: true
    t.index ["shop_id"], name: "index_categories_on_shop_id"
  end

  create_table "jwt_denylist", force: :cascade do |t|
    t.string "jti", null: false
    t.datetime "exp", null: false
    t.index ["jti"], name: "index_jwt_denylist_on_jti"
  end

  create_table "listing_types", force: :cascade do |t|
    t.bigint "shop_id", null: false
    t.string "name", null: false
    t.string "code"
    t.text "description"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id", "name"], name: "index_listing_types_on_shop_id_and_name", unique: true
    t.index ["shop_id"], name: "index_listing_types_on_shop_id"
  end

  create_table "memberships", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "shop_id", null: false
    t.string "role", default: "staff", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id"], name: "index_memberships_on_shop_id"
    t.index ["user_id", "shop_id"], name: "index_memberships_on_user_id_and_shop_id", unique: true
    t.index ["user_id"], name: "index_memberships_on_user_id"
  end

  create_table "option_type_sets", force: :cascade do |t|
    t.bigint "shop_id", null: false
    t.string "name", null: false
    t.string "code"
    t.text "description"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id", "name"], name: "index_option_type_sets_on_shop_id_and_name", unique: true
    t.index ["shop_id"], name: "index_option_type_sets_on_shop_id"
  end

  create_table "option_types", force: :cascade do |t|
    t.bigint "product_id", null: false
    t.string "name", null: false
    t.string "values", default: [], array: true
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["product_id", "name"], name: "index_option_types_on_product_id_and_name", unique: true
    t.index ["product_id"], name: "index_option_types_on_product_id"
  end

  create_table "product_types", force: :cascade do |t|
    t.bigint "shop_id", null: false
    t.string "name", null: false
    t.string "code"
    t.text "description"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id", "name"], name: "index_product_types_on_shop_id_and_name", unique: true
    t.index ["shop_id"], name: "index_product_types_on_shop_id"
  end

  create_table "products", force: :cascade do |t|
    t.bigint "shop_id", null: false
    t.string "name", null: false
    t.text "description"
    t.decimal "price", precision: 10, scale: 2, null: false
    t.string "sku", null: false
    t.integer "stock_quantity", default: 0
    t.string "image_url"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "vendor_id"
    t.bigint "product_type_id"
    t.bigint "listing_type_id"
    t.bigint "category_id"
    t.bigint "subcategory_id"
    t.bigint "shop_location_id"
    t.index ["category_id"], name: "index_products_on_category_id"
    t.index ["listing_type_id"], name: "index_products_on_listing_type_id"
    t.index ["product_type_id"], name: "index_products_on_product_type_id"
    t.index ["shop_id", "sku"], name: "index_products_on_shop_id_and_sku", unique: true
    t.index ["shop_id"], name: "index_products_on_shop_id"
    t.index ["subcategory_id"], name: "index_products_on_subcategory_id"
    t.index ["vendor_id"], name: "index_products_on_vendor_id"
  end

  create_table "shop_locations", force: :cascade do |t|
    t.bigint "shop_id", null: false
    t.string "name", null: false
    t.string "code"
    t.text "description"
    t.text "address"
    t.string "city"
    t.string "state"
    t.string "postal_code"
    t.string "country"
    t.string "phone"
    t.string "email"
    t.boolean "active", default: true
    t.boolean "primary", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id", "name"], name: "index_shop_locations_on_shop_id_and_name", unique: true
    t.index ["shop_id"], name: "index_shop_locations_on_shop_id"
  end

  create_table "shops", force: :cascade do |t|
    t.string "name", null: false
    t.string "subdomain", null: false
    t.text "description"
    t.string "logo_url"
    t.string "domain"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["domain"], name: "index_shops_on_domain", unique: true
    t.index ["subdomain"], name: "index_shops_on_subdomain", unique: true
  end

  create_table "subcategories", force: :cascade do |t|
    t.bigint "shop_id", null: false
    t.bigint "category_id", null: false
    t.string "name", null: false
    t.string "code"
    t.text "description"
    t.string "slug"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_subcategories_on_category_id"
    t.index ["shop_id", "category_id", "name"], name: "index_subcategories_on_shop_id_and_category_id_and_name", unique: true
    t.index ["shop_id", "category_id", "slug"], name: "index_subcategories_on_shop_id_and_category_id_and_slug", unique: true
    t.index ["shop_id"], name: "index_subcategories_on_shop_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "full_name", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "vendors", force: :cascade do |t|
    t.bigint "shop_id", null: false
    t.string "name", null: false
    t.string "code"
    t.text "description"
    t.string "contact_email"
    t.string "contact_phone"
    t.string "website"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id", "name"], name: "index_vendors_on_shop_id_and_name", unique: true
    t.index ["shop_id"], name: "index_vendors_on_shop_id"
  end

  add_foreign_key "categories", "shops"
  add_foreign_key "listing_types", "shops"
  add_foreign_key "memberships", "shops"
  add_foreign_key "memberships", "users"
  add_foreign_key "option_type_sets", "shops"
  add_foreign_key "option_types", "products"
  add_foreign_key "product_types", "shops"
  add_foreign_key "products", "categories"
  add_foreign_key "products", "listing_types"
  add_foreign_key "products", "product_types"
  add_foreign_key "products", "shops"
  add_foreign_key "products", "subcategories"
  add_foreign_key "products", "vendors"
  add_foreign_key "shop_locations", "shops"
  add_foreign_key "subcategories", "categories"
  add_foreign_key "subcategories", "shops"
  add_foreign_key "vendors", "shops"
end
