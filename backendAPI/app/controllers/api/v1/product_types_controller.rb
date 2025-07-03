class Api::V1::ProductTypesController < Api::V1::BaseController
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
      render json: { errors: @product_type.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @product_type.update(product_type_params)
      render json: @product_type
    else
      render json: { errors: @product_type.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @product_type.destroy
    head :no_content
  end

  private

  def set_shop
    @shop = current_user.shops.find(params[:shop_id])
  end

  def set_product_type
    @product_type = @shop.product_types.find(params[:id])
  end

  def product_type_params
    params.require(:product_type).permit(:name, :description, :active)
  end
end 