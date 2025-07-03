require 'csv'

class Api::V1::OptionTypeSetsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_shop
  before_action :set_option_type_set, only: [:show, :update, :destroy]

  def index
    @option_type_sets = @shop.option_type_sets
    render json: @option_type_sets
  end

  def show
    render json: @option_type_set
  end

  def create
    @option_type_set = @shop.option_type_sets.build(option_type_set_params)
    if @option_type_set.save
      render json: @option_type_set, status: :created
    else
      render json: { error: @option_type_set.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def update
    if @option_type_set.update(option_type_set_params)
      render json: @option_type_set
    else
      render json: { error: @option_type_set.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def destroy
    @option_type_set.destroy
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
        
        # Check if option type set already exists by name
        existing_option_type_set = @shop.option_type_sets.find_by(name: row['name'])
        
        if existing_option_type_set
          # Update existing record
          if existing_option_type_set.update(
            description: row['description'],
            active: active
          )
            updated_count += 1
          else
            error_message = existing_option_type_set.errors.full_messages.join(', ')
            errors << "Row #{row_number} (update): #{error_message}"
            Rails.logger.error "Bulk upload update error for row #{row_number}: #{error_message}"
          end
        else
          # Create new record
          option_type_set_data = {
            name: row['name'],
            code: row['code'],
            description: row['description'],
            active: active
          }

          option_type_set = @shop.option_type_sets.build(option_type_set_data)
          
          if option_type_set.save
            created_count += 1
          else
            error_message = option_type_set.errors.full_messages.join(', ')
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
          message: "Created #{created_count} and updated #{updated_count} option type sets with #{errors.length} errors"
        }, status: :partial_content
      else
        render json: { 
          created_count: created_count,
          updated_count: updated_count,
          message: "Successfully created #{created_count} and updated #{updated_count} option type sets"
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

  def set_option_type_set
    @option_type_set = @shop.option_type_sets.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Option type set not found' }, status: :not_found
  end

  def option_type_set_params
    params.require(:option_type_set).permit(:name, :code, :description, :active)
  end
end 