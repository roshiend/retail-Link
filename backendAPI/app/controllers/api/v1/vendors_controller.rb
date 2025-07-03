class Api::V1::VendorsController < Api::V1::BaseController
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
      render json: { errors: @vendor.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @vendor.update(vendor_params)
      render json: @vendor
    else
      render json: { errors: @vendor.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @vendor.destroy
    head :no_content
  end

  private

  def set_shop
    @shop = current_user.shops.find(params[:shop_id])
  end

  def set_vendor
    @vendor = @shop.vendors.find(params[:id])
  end

  def vendor_params
    params.require(:vendor).permit(:name, :description, :contact_email, :contact_phone, :website, :active)
  end
end 