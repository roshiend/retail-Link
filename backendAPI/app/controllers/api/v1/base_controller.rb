module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_user!
      before_action :set_shop, if: :shop_required?

      private

      def shop_required?
        params[:shop_id].present?
      end

      def set_shop
        @shop = current_user.shops.find(params[:shop_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Shop not found or access denied' }, status: :not_found
      end

      def current_shop
        @shop
      end
    end
  end
end 