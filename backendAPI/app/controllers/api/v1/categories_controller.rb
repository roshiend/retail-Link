class Api::V1::CategoriesController < Api::V1::BaseController
  before_action :set_shop
  before_action :set_category, only: [:show, :update, :destroy, :subcategories]

  def index
    @categories = @shop.categories
    render json: @categories
  end

  def show
    render json: @category
  end

  def create
    @category = @shop.categories.build(category_params)
    if @category.save
      render json: @category, status: :created
    else
      render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @category.update(category_params)
      render json: @category
    else
      render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @category.destroy
    head :no_content
  end

  def subcategories
    @subcategories = @category.subcategories
    render json: @subcategories
  end

  private

  def set_shop
    @shop = current_user.shops.find(params[:shop_id])
  end

  def set_category
    @category = @shop.categories.find(params[:id])
  end

  def category_params
    params.require(:category).permit(:name, :description, :slug, :active)
  end
end 