class Api::V1::SubcategoriesController < Api::V1::BaseController
  before_action :set_shop
  before_action :set_category, only: [:index, :create]
  before_action :set_subcategory, only: [:show, :update, :destroy]

  def index
    @subcategories = @category.subcategories
    render json: @subcategories
  end

  def show
    render json: @subcategory
  end

  def create
    @subcategory = @category.subcategories.build(subcategory_params)
    @subcategory.shop = @shop
    if @subcategory.save
      render json: @subcategory, status: :created
    else
      render json: { errors: @subcategory.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @subcategory.update(subcategory_params)
      render json: @subcategory
    else
      render json: { errors: @subcategory.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @subcategory.destroy
    head :no_content
  end

  private

  def set_shop
    @shop = current_user.shops.find(params[:shop_id])
  end

  def set_category
    @category = @shop.categories.find(params[:category_id])
  end

  def set_subcategory
    @subcategory = @shop.subcategories.find(params[:id])
  end

  def subcategory_params
    params.require(:subcategory).permit(:name, :description, :slug, :active)
  end
end 