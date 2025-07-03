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
      
      created_count = 0
      updated_count = 0
      errors = []

      csv_data.each_with_index do |row, index|
        row_number = index + 2 # +2 because of 0-based index and header row
        
        # Convert string values to appropriate types
        active = row['active'].to_s.downcase == 'true' if row['active'].present?
        
        # Check if category already exists by name
        existing_category = @shop.categories.find_by(name: row['name'])
        
        if existing_category
          # Update existing record
          if existing_category.update(
            description: row['description'],
            active: active
          )
            updated_count += 1
          else
            error_message = existing_category.errors.full_messages.join(', ')
            errors << "Row #{row_number} (update): #{error_message}"
            Rails.logger.error "Bulk upload update error for row #{row_number}: #{error_message}"
          end
        else
          # Create new record
          category_data = {
            name: row['name'],
            code: row['code'],
            description: row['description'],
            active: active
          }

          category = @shop.categories.build(category_data)
          
          if category.save
            created_count += 1
          else
            error_message = category.errors.full_messages.join(', ')
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
          message: "Created #{created_count} and updated #{updated_count} categories with #{errors.length} errors"
        }, status: :partial_content
      else
        render json: { 
          created_count: created_count,
          updated_count: updated_count,
          message: "Successfully created #{created_count} and updated #{updated_count} categories"
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