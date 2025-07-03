class Api::V1::ListingTypesController < Api::V1::BaseController
  before_action :set_shop
  before_action :set_listing_type, only: [:show, :update, :destroy]

  def index
    @listing_types = @shop.listing_types
    render json: @listing_types
  end

  def show
    render json: @listing_type
  end

  def create
    @listing_type = @shop.listing_types.build(listing_type_params)
    if @listing_type.save
      render json: @listing_type, status: :created
    else
      render json: { errors: @listing_type.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @listing_type.update(listing_type_params)
      render json: @listing_type
    else
      render json: { errors: @listing_type.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @listing_type.destroy
    head :no_content
  end

  private

  def set_shop
    @shop = current_user.shops.find(params[:shop_id])
  end

  def set_listing_type
    @listing_type = @shop.listing_types.find(params[:id])
  end

  def listing_type_params
    params.require(:listing_type).permit(:name, :description, :active)
  end
end 