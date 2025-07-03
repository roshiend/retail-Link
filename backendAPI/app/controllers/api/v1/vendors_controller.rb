require 'csv'

class Api::V1::VendorsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_shop
  before_action :set_vendor, only: [:show, :update, :destroy]

  def index
    @vendors = @shop.vendors
    render json: @vendors
  end

  def show
    render json: @vendor
  end

  def create
    @vendor = @shop.vendors.build(vendor_params)
    if @vendor.save
      render json: @vendor, status: :created
    else
      render json: { error: @vendor.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def update
    if @vendor.update(vendor_params)
      render json: @vendor
    else
      render json: { error: @vendor.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def destroy
    @vendor.destroy
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
        
        # Check if vendor already exists by name
        existing_vendor = @shop.vendors.find_by(name: row['name'])
        
        if existing_vendor
          # Update existing record
          if existing_vendor.update(
            description: row['description'],
            contact_email: row['contact_email'],
            contact_phone: row['contact_phone'],
            website: row['website'],
            active: active
          )
            updated_count += 1
          else
            error_message = existing_vendor.errors.full_messages.join(', ')
            errors << "Row #{row_number} (update): #{error_message}"
            Rails.logger.error "Bulk upload update error for row #{row_number}: #{error_message}"
          end
        else
          # Create new record
          vendor_data = {
            name: row['name'],
            code: row['code'],
            description: row['description'],
            contact_email: row['contact_email'],
            contact_phone: row['contact_phone'],
            website: row['website'],
            active: active
          }

          vendor = @shop.vendors.build(vendor_data)
          
          if vendor.save
            created_count += 1
          else
            error_message = vendor.errors.full_messages.join(', ')
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
          message: "Created #{created_count} and updated #{updated_count} vendors with #{errors.length} errors"
        }, status: :partial_content
      else
        render json: { 
          created_count: created_count,
          updated_count: updated_count,
          message: "Successfully created #{created_count} and updated #{updated_count} vendors"
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

  def set_vendor
    @vendor = @shop.vendors.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Vendor not found' }, status: :not_found
  end

  def vendor_params
    params.require(:vendor).permit(:name, :code, :description, :contact_email, :contact_phone, :website, :active)
  end
end 