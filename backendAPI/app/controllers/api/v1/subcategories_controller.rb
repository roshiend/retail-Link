require 'csv'

class Api::V1::SubcategoriesController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_shop
  before_action :set_category, only: [:index, :create, :bulk_upload]
  before_action :set_subcategory, only: [:show, :update, :destroy]

  def index
    @subcategories = @category.subcategories
    render json: @subcategories
  end

  def show
    render json: @subcategory
  end

  def create
    @subcategory = @category.subcategories.build(subcategory_params)
    @subcategory.shop = @shop
    if @subcategory.save
      render json: @subcategory, status: :created
    else
      render json: { error: @subcategory.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def update
    if @subcategory.update(subcategory_params)
      render json: @subcategory
    else
      render json: { error: @subcategory.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def destroy
    @subcategory.destroy
    head :no_content
  end

  def bulk_upload
    unless params[:file] && params[:file].content_type == 'text/csv'
      render json: { error: 'Please upload a valid CSV file' }, status: :unprocessable_entity
      return
    end

    begin
      csv_content = params[:file].read.force_encoding('UTF-8')
      csv_data = CSV.parse(csv_content, headers: true)
      
      created_count = 0
      updated_count = 0
      errors = []

      csv_data.each_with_index do |row, index|
        row_number = index + 2 # +2 because of 0-based index and header row
        
        # Convert string values to appropriate types
        active = row['active'].to_s.downcase == 'true' if row['active'].present?
        
        # Check if subcategory already exists by name within the category
        existing_subcategory = @category.subcategories.find_by(name: row['name'])
        
        if existing_subcategory
          # Update existing record
          if existing_subcategory.update(
            description: row['description'],
            active: active
          )
            updated_count += 1
          else
            error_message = existing_subcategory.errors.full_messages.join(', ')
            errors << "Row #{row_number} (update): #{error_message}"
            Rails.logger.error "Bulk upload update error for row #{row_number}: #{error_message}"
          end
        else
          # Create new record
          subcategory_data = {
            name: row['name'],
            code: row['code'],
            description: row['description'],
            active: active
          }

          subcategory = @category.subcategories.build(subcategory_data)
          
          if subcategory.save
            created_count += 1
          else
            error_message = subcategory.errors.full_messages.join(', ')
            errors << "Row #{row_number} (create): #{error_message}"
            Rails.logger.error "Bulk upload create error for row #{row_number}: #{error_message}"
          end
        end
      end

      if errors.any?
        render json: { 
          created_count: created_count,
          updated_count: updated_count,
          errors: errors,
          message: "Created #{created_count} and updated #{updated_count} subcategories with #{errors.length} errors"
        }, status: :partial_content
      else
        render json: { 
          created_count: created_count,
          updated_count: updated_count,
          message: "Successfully created #{created_count} and updated #{updated_count} subcategories"
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
    @category = @shop.categories.find(params[:category_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Category not found' }, status: :not_found
  end

  def set_subcategory
    @subcategory = @shop.subcategories.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Subcategory not found' }, status: :not_found
  end

  def subcategory_params
    params.require(:subcategory).permit(:name, :code, :description, :slug, :active)
  end
end 