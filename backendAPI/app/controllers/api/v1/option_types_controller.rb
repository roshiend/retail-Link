class Api::V1::OptionTypesController < Api::V1::BaseController
  before_action :set_shop
  before_action :set_product, only: [:index, :create]
  before_action :set_option_type, only: [:show, :update, :destroy]

  def index
    @option_types = @product.option_types
    render json: @option_types
  end

  def show
    render json: @option_type
  end

  def create
    @option_type = @product.option_types.build(option_type_params)
    if @option_type.save
      render json: @option_type, status: :created
    else
      render json: { errors: @option_type.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @option_type.update(option_type_params)
      render json: @option_type
    else
      render json: { errors: @option_type.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @option_type.destroy
    head :no_content
  end

  private

  def set_shop
    @shop = current_user.shops.find(params[:shop_id])
  end

  def set_product
    @product = @shop.products.find(params[:product_id])
  end

  def set_option_type
    @option_type = @shop.products.find(params[:product_id]).option_types.find(params[:id])
  end

  def option_type_params
    params.require(:option_type).permit(:name, :active, values: [])
  end
end 