module Api
  module V1
    class VariantsController < BaseController
      before_action :set_product
      before_action :set_variant, only: [:show, :update, :destroy]

      def index
        variants = @product.variants.ordered
        render json: variants
      end

      def show
        render json: @variant
      end

      def create
        variant = @product.variants.build(variant_params)
        if variant.save
          render json: variant, status: :created
        else
          render json: { errors: variant.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @variant.update(variant_params)
          render json: @variant
        else
          render json: { errors: @variant.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @variant.destroy
        head :no_content
      end

      def bulk_update
        variants_params = params.require(:variants)
        
        ActiveRecord::Base.transaction do
          variants_params.each do |variant_param|
            variant = @product.variants.find(variant_param[:id])
            variant.update!(variant_param.permit(:price, :quantity, :option1, :option2, :option3, :active))
          end
        end
        
        render json: @product.variants.ordered
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      private

      def set_product
        @product = current_shop.products.find(params[:product_id])
      end

      def set_variant
        @variant = @product.variants.find(params[:id])
      end

      def variant_params
        params.require(:variant).permit(:sku, :price, :quantity, :option1, :option2, :option3, :position, :active)
      end
    end
  end
end 