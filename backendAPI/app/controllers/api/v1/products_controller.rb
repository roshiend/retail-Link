module Api
  module V1
    class ProductsController < BaseController
      def index
        products = current_shop.products.includes(:option_types, :variants)
        render json: products.as_json(
          include: {
            option_types: { only: [:id, :name, :values, :position] },
            variants: { only: [:id, :sku, :price, :quantity, :option1, :option2, :option3, :position, :active] }
          }
        )
      end

      def create
        product = current_shop.products.build(product_params)
        
        # Set positions for option types
        set_option_type_positions(product)
        
        if product.save
          # After save, the model will handle variant management automatically
          render json: product_with_associations(product), status: :created
        else
          render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        product = current_shop.products.find(params[:id])
        
        Rails.logger.info "Updating product #{product.id} with params: #{product_params}"
        
        # Store original option types for comparison
        original_option_types = product.option_types.map { |ot| { name: ot.name, values: ot.values } }
        
        # Set positions for option types
        set_option_type_positions(product)
        
        if product.update(product_params)
          # After update, the model will handle variant management automatically
          # Log what changed for debugging
          new_option_types = product.option_types.map { |ot| { name: ot.name, values: ot.values } }
          Rails.logger.info "Option types changed: #{original_option_types != new_option_types}"
          
          render json: product_with_associations(product)
        else
          Rails.logger.error "Product update failed: #{product.errors.full_messages}"
          render json: { 
            errors: product.errors.full_messages,
            details: product.errors.details,
            validation_errors: product.errors.to_hash
          }, status: :unprocessable_entity
        end
      end

      def destroy
        product = current_shop.products.find(params[:id])
        product.destroy
        head :no_content
      end

      def show
        product = current_shop.products.find(params[:id])
        render json: product_with_associations(product)
      end

      private

      def product_params
        params.require(:product).permit(
          :name, :description, :price, :compare_at_price, :sku, :barcode, :weight, :weight_unit,
          :inventory, :status, :vendor_id, :product_type_id, :shop_location_id,
          :category_id, :subcategory_id, :listing_type_id, :active,
          option_types_attributes: [
            :id, :name, :_destroy,
            values: []
          ],
          variants_attributes: [
            :id, :sku, :price, :compare_at_price, :quantity, :option1, :option2, :option3, :active, :_destroy
          ]
        )
      end

      def product_with_associations(product)
        product.as_json(
          include: {
            option_types: { only: [:id, :name, :values, :position] },
            variants: { only: [:id, :sku, :price, :quantity, :option1, :option2, :option3, :position, :active] }
          }
        )
      end

      def set_option_type_positions(product)
        # Set positions for option types only
        product.option_types.each_with_index do |option_type, index|
          option_type.position = index + 1
        end
      end
    end
  end
end 