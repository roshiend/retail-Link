class Api::V1::ShopLocationsController < Api::V1::BaseController
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
      render json: { errors: @shop_location.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @shop_location.update(shop_location_params)
      render json: @shop_location
    else
      render json: { errors: @shop_location.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @shop_location.destroy
    head :no_content
  end

  private

  def set_shop
    @shop = current_user.shops.find(params[:shop_id])
  end

  def set_shop_location
    @shop_location = @shop.shop_locations.find(params[:id])
  end

  def shop_location_params
    params.require(:shop_location).permit(:name, :address, :city, :state, :postal_code, :country, :phone, :email, :active, :primary)
  end
end 