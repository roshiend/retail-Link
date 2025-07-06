require 'csv'

class Api::V1::CategoriesController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_shop
  before_action :set_category, only: [:show, :update, :destroy, :subcategories]

  def index
    @categories = @shop.categories.includes(:subcategories)
    render json: @categories.as_json(include: :subcategories)
  end

  def show
    render json: @category.as_json(include: :subcategories)
  end

  def create
    @category = @shop.categories.build(category_params)
    if @category.save
      render json: @category.as_json(include: :subcategories), status: :created
    else
      render json: { error: @category.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def update
    if @category.update(category_params)
      render json: @category.as_json(include: :subcategories)
    else
      render json: { error: @category.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def destroy
    @category.destroy
    head :no_content
  end

  def bulk_delete
    category_ids = params[:ids]
    
    unless category_ids.is_a?(Array) && category_ids.any?
      render json: { error: 'Please provide an array of category IDs to delete' }, status: :unprocessable_entity
      return
    end

    begin
      # Find categories that belong to this shop
      categories_to_delete = @shop.categories.where(id: category_ids)
      deleted_count = categories_to_delete.count
      
      # Count subcategories that will be deleted
      subcategories_deleted = 0
      categories_to_delete.each do |category|
        subcategories_deleted += category.subcategories.count
      end
      
      # Check if any products are using these categories
      products_using_categories = Product.where(category_id: category_ids, shop_id: @shop.id)
      
      if products_using_categories.any?
        category_names = categories_to_delete.pluck(:name).join(', ')
        render json: { 
          error: "Cannot delete categories that are being used by products. Categories: #{category_names}" 
        }, status: :unprocessable_entity
        return
      end

      # Delete the categories (this will also delete associated subcategories due to dependent: :destroy)
      categories_to_delete.destroy_all

      render json: { 
        deleted_count: deleted_count,
        subcategories_deleted: subcategories_deleted,
        message: "Successfully deleted #{deleted_count} categories and #{subcategories_deleted} subcategories"
      }
    rescue StandardError => e
      Rails.logger.error "Bulk delete error: #{e.message}"
      render json: { error: "Delete failed: #{e.message}" }, status: :unprocessable_entity
    end
  end

  def subcategories
    @subcategories = @category.subcategories
    render json: @subcategories
  end

  def bulk_upload
    unless params[:file] && params[:file].content_type == 'text/csv'
      render json: { error: 'Please upload a valid CSV file' }, status: :unprocessable_entity
      return
    end

    begin
      csv_content = params[:file].read.force_encoding('UTF-8')
      csv_data = CSV.parse(csv_content, headers: true)
      
      Rails.logger.info "Bulk upload: Processing #{csv_data.count} rows"
      
      created_count = 0
      updated_count = 0
      subcategories_created = 0
      subcategories_updated = 0
      errors = []

      # Group rows by category (assuming subcategories have a parent_category column)
      categories_data = {}
      
      csv_data.each_with_index do |row, index|
        row_number = index + 2 # +2 because of 0-based index and header row
        
        Rails.logger.debug "Processing row #{row_number}: #{row.to_h}"
        
        # Convert string values to appropriate types
        category_active = row['category_active'].to_s.downcase == 'true' if row['category_active'].present?
        subcategory_active = row['subcategory_active'].to_s.downcase == 'true' if row['subcategory_active'].present?
        
        category_name = row['category_name']
        subcategory_name = row['subcategory_name']
        
        if category_name.present?
          # Initialize category data if not exists
          categories_data[category_name] ||= {
            name: category_name,
            code: row['category_code'],
            description: row['category_description'],
            active: category_active.nil? ? true : category_active, # Default to true if not specified
            subcategories: []
          }
          
          # Add subcategory if present
          if subcategory_name.present?
            categories_data[category_name][:subcategories] << {
              name: subcategory_name,
              code: row['subcategory_code'],
              description: row['subcategory_description'],
              active: subcategory_active.nil? ? true : subcategory_active # Default to true if not specified
            }
          end
        end
      end
      
      Rails.logger.info "Bulk upload: Grouped into #{categories_data.keys.count} categories"

      # Process each category and its subcategories
      categories_data.each do |category_name, category_data|
        # Check if category already exists by name
        existing_category = @shop.categories.find_by(name: category_name)
        
        if existing_category
          # Update existing category
          update_attributes = {}
          update_attributes[:description] = category_data[:description] if category_data[:description].present?
          update_attributes[:active] = category_data[:active] if category_data[:active] != nil
          
          if existing_category.update(update_attributes)
            updated_count += 1
            
            # Handle subcategories for existing category
            if category_data[:subcategories].any?
              category_data[:subcategories].each do |sub_data|
                existing_sub = existing_category.subcategories.find_by(name: sub_data[:name])
                
                if existing_sub
                  # Update existing subcategory
                  sub_update_attributes = {}
                  sub_update_attributes[:description] = sub_data[:description] if sub_data[:description].present?
                  sub_update_attributes[:active] = sub_data[:active] if sub_data[:active] != nil
                  
                  if existing_sub.update(sub_update_attributes)
                    subcategories_updated += 1
                  else
                    error_message = existing_sub.errors.full_messages.join(', ')
                    errors << "Subcategory update error for '#{sub_data[:name]}': #{error_message}"
                  end
                else
                  # Create new subcategory
                  subcategory = existing_category.subcategories.build(
                    name: sub_data[:name],
                    code: sub_data[:code].present? ? sub_data[:code] : nil, # Let model handle auto-generation
                    description: sub_data[:description],
                    active: sub_data[:active]
                  )
                  subcategory.shop = @shop # Ensure shop is assigned
                  
                  if subcategory.save
                    subcategories_created += 1
                  else
                    error_message = subcategory.errors.full_messages.join(', ')
                    errors << "Subcategory create error for '#{sub_data[:name]}': #{error_message}"
                  end
                end
              end
            end
          else
            error_message = existing_category.errors.full_messages.join(', ')
            errors << "Category update error for '#{category_name}': #{error_message}"
            Rails.logger.error "Bulk upload update error for category '#{category_name}': #{error_message}"
          end
        else
          # Create new category
          category = @shop.categories.build(
            name: category_data[:name],
            code: category_data[:code].present? ? category_data[:code] : nil, # Let model handle auto-generation
            description: category_data[:description],
            active: category_data[:active]
          )
          
          if category.save
            created_count += 1
            
            # Create subcategories for new category
            if category_data[:subcategories].any?
              category_data[:subcategories].each do |sub_data|
                subcategory = category.subcategories.build(
                  name: sub_data[:name],
                  code: sub_data[:code].present? ? sub_data[:code] : nil, # Let model handle auto-generation
                  description: sub_data[:description],
                  active: sub_data[:active]
                )
                subcategory.shop = @shop # Ensure shop is assigned
                
                if subcategory.save
                  subcategories_created += 1
                else
                  error_message = subcategory.errors.full_messages.join(', ')
                  errors << "Subcategory create error for '#{sub_data[:name]}': #{error_message}"
                end
              end
            end
          else
            error_message = category.errors.full_messages.join(', ')
            errors << "Category create error for '#{category_name}': #{error_message}"
            Rails.logger.error "Bulk upload create error for category '#{category_name}': #{error_message}"
          end
        end
      end

      if errors.any?
        render json: { 
          created_count: created_count,
          updated_count: updated_count,
          subcategories_created: subcategories_created,
          subcategories_updated: subcategories_updated,
          errors: errors,
          message: "Created #{created_count} and updated #{updated_count} categories, created #{subcategories_created} and updated #{subcategories_updated} subcategories with #{errors.length} errors"
        }, status: :partial_content
      else
        render json: { 
          created_count: created_count,
          updated_count: updated_count,
          subcategories_created: subcategories_created,
          subcategories_updated: subcategories_updated,
          message: "Successfully created #{created_count} and updated #{updated_count} categories, created #{subcategories_created} and updated #{subcategories_updated} subcategories"
        }
      end
    rescue CSV::MalformedCSVError => e
      Rails.logger.error "CSV parsing error: #{e.message}"
      render json: { error: "Invalid CSV format: #{e.message}" }, status: :unprocessable_entity
    rescue StandardError => e
      Rails.logger.error "Bulk upload error: #{e.message}"
      render json: { error: "Upload failed: #{e.message}" }, status: :unprocessable_entity
    end
  end

  private

  def set_shop
    @shop = current_user.shops.find(params[:shop_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Shop not found' }, status: :not_found
  end

  def set_category
    @category = @shop.categories.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Category not found' }, status: :not_found
  end

  def category_params
    params.require(:category).permit(:name, :code, :description, :slug, :active)
  end
end 