module Api
  module V1
    class ProductsController < BaseController
      def index
        products = current_shop.products
        render json: products
      end

      def create
        product = current_shop.products.build(product_params)
        if product.save
          render json: product, status: :created
        else
          render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        product = current_shop.products.find(params[:id])
        if product.update(product_params)
          render json: product
        else
          render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        product = current_shop.products.find(params[:id])
        product.destroy
        head :no_content
      end

      private

      def product_params
        params.require(:product).permit(:name, :description, :price, :stock_quantity, :image_url, :active)
      end
    end
  end
end 