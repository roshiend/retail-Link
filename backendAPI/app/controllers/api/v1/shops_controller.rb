module Api
  module V1
    class ShopsController < BaseController
      skip_before_action :set_shop, only: [:index, :create]

      def index
        render json: {
          owned_shops: current_user.owned_shops,
          staff_shops: current_user.staff_shops
        }
      end

      def create
        shop = Shop.new(shop_params)
        ActiveRecord::Base.transaction do
          if shop.save
            Membership.create!(user: current_user, shop: shop, role: 'owner')
            render json: shop, status: :created
          else
            render json: { errors: shop.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end

      def invite
        user = User.find_by(email: params[:email])
        if user.nil?
          render json: { error: 'User not found' }, status: :not_found
          return
        end

        membership = Membership.new(user: user, shop: current_shop, role: params[:role] || 'staff')
        if membership.save
          render json: { message: 'User invited successfully' }
        else
          render json: { errors: membership.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def shop_params
        params.require(:shop).permit(:name, :description, :logo_url, :domain)
      end
    end
  end
end 