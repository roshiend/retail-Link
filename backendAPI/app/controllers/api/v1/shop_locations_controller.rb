require 'csv'

class Api::V1::ShopLocationsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_shop
  before_action :set_shop_location, only: [:show, :update, :destroy]

  def index
    @shop_locations = @shop.shop_locations
    render json: @shop_locations
  end

  def show
    render json: @shop_location
  end

  def create
    @shop_location = @shop.shop_locations.build(shop_location_params)
    if @shop_location.save
      render json: @shop_location, status: :created
    else
      render json: { error: @shop_location.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def update
    if @shop_location.update(shop_location_params)
      render json: @shop_location
    else
      render json: { error: @shop_location.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def destroy
    @shop_location.destroy
    head :no_content
  end

  def bulk_delete
    shop_location_ids = params[:ids]
    
    unless shop_location_ids.is_a?(Array) && shop_location_ids.any?
      render json: { error: 'Please provide an array of shop location IDs to delete' }, status: :unprocessable_entity
      return
    end

    begin
      # Find shop locations that belong to this shop
      shop_locations_to_delete = @shop.shop_locations.where(id: shop_location_ids)
      deleted_count = shop_locations_to_delete.count
      
      # Check if any products are using these shop locations
      products_using_locations = Product.where(shop_location_id: shop_location_ids, shop_id: @shop.id)
      
      if products_using_locations.any?
        location_names = shop_locations_to_delete.pluck(:name).join(', ')
        render json: { 
          error: "Cannot delete shop locations that are being used by products. Shop locations: #{location_names}" 
        }, status: :unprocessable_entity
        return
      end

      # Delete the shop locations
      shop_locations_to_delete.destroy_all

      render json: { 
        deleted_count: deleted_count,
        message: "Successfully deleted #{deleted_count} shop locations"
      }
    rescue StandardError => e
      Rails.logger.error "Bulk delete error: #{e.message}"
      render json: { error: "Delete failed: #{e.message}" }, status: :unprocessable_entity
    end
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
        primary = row['primary'].to_s.downcase == 'true' if row['primary'].present?
        
        # Check if shop location already exists by name
        existing_shop_location = @shop.shop_locations.find_by(name: row['name'])
        
        if existing_shop_location
          # Update existing record
          if existing_shop_location.update(
            description: row['description'],
            address: row['address'],
            city: row['city'],
            state: row['state'],
            postal_code: row['postal_code'],
            country: row['country'],
            phone: row['phone'],
            email: row['email'],
            active: active,
            primary: primary
          )
            updated_count += 1
          else
            error_message = existing_shop_location.errors.full_messages.join(', ')
            errors << "Row #{row_number} (update): #{error_message}"
            Rails.logger.error "Bulk upload update error for row #{row_number}: #{error_message}"
          end
        else
          # Create new record
          shop_location_data = {
            name: row['name'],
            code: row['code'],
            description: row['description'],
            address: row['address'],
            city: row['city'],
            state: row['state'],
            postal_code: row['postal_code'],
            country: row['country'],
            phone: row['phone'],
            email: row['email'],
            active: active,
            primary: primary
          }

          shop_location = @shop.shop_locations.build(shop_location_data)
          
          if shop_location.save
            created_count += 1
          else
            error_message = shop_location.errors.full_messages.join(', ')
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
          message: "Created #{created_count} and updated #{updated_count} shop locations with #{errors.length} errors"
        }, status: :partial_content
      else
        render json: { 
          created_count: created_count,
          updated_count: updated_count,
          message: "Successfully created #{created_count} and updated #{updated_count} shop locations"
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

  def set_shop_location
    @shop_location = @shop.shop_locations.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Shop location not found' }, status: :not_found
  end

  def shop_location_params
    params.require(:shop_location).permit(:name, :code, :description, :address, :city, :state, :postal_code, :country, :phone, :email, :active, :primary)
  end
end 