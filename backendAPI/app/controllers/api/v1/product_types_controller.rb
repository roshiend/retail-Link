require 'csv'

class Api::V1::ProductTypesController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_shop
  before_action :set_product_type, only: [:show, :update, :destroy]

  def index
    @product_types = @shop.product_types
    render json: @product_types
  end

  def show
    render json: @product_type
  end

  def create
    @product_type = @shop.product_types.build(product_type_params)
    if @product_type.save
      render json: @product_type, status: :created
    else
      render json: { error: @product_type.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def update
    if @product_type.update(product_type_params)
      render json: @product_type
    else
      render json: { error: @product_type.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def destroy
    @product_type.destroy
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
        
        # Check if product type already exists by name
        existing_product_type = @shop.product_types.find_by(name: row['name'])
        
        if existing_product_type
          # Update existing record
          if existing_product_type.update(
            description: row['description'],
            active: active
          )
            updated_count += 1
          else
            error_message = existing_product_type.errors.full_messages.join(', ')
            errors << "Row #{row_number} (update): #{error_message}"
            Rails.logger.error "Bulk upload update error for row #{row_number}: #{error_message}"
          end
        else
          # Create new record
          product_type_data = {
            name: row['name'],
            code: row['code'],
            description: row['description'],
            active: active
          }

          product_type = @shop.product_types.build(product_type_data)
          
          if product_type.save
            created_count += 1
          else
            error_message = product_type.errors.full_messages.join(', ')
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
          message: "Created #{created_count} and updated #{updated_count} product types with #{errors.length} errors"
        }, status: :partial_content
      else
        render json: { 
          created_count: created_count,
          updated_count: updated_count,
          message: "Successfully created #{created_count} and updated #{updated_count} product types"
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

  def set_product_type
    @product_type = @shop.product_types.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Product type not found' }, status: :not_found
  end

  def product_type_params
    params.require(:product_type).permit(:name, :code, :description, :active)
  end
end 