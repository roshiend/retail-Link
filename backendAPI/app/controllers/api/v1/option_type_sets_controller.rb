class Api::V1::OptionTypeSetsController < Api::V1::BaseController
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
      render json: { errors: @option_type_set.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @option_type_set.update(option_type_set_params)
      render json: @option_type_set
    else
      render json: { errors: @option_type_set.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @option_type_set.destroy
    head :no_content
  end

  private

  def set_shop
    @shop = current_user.shops.find(params[:shop_id])
  end

  def set_option_type_set
    @option_type_set = @shop.option_type_sets.find(params[:id])
  end

  def option_type_set_params
    params.require(:option_type_set).permit(:name, :description, :active)
  end
end 