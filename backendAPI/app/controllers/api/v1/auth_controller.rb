module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [:signup, :login]

      def signup
        ActiveRecord::Base.transaction do
          user = User.new(
            email: params[:email],
            password: params[:password],
            password_confirmation: params[:password_confirmation],
            full_name: params[:full_name]
          )

          if user.save
            shop = Shop.create!(
              name: params[:store_name]
            )

            Membership.create!(
              user: user,
              shop: shop,
              role: 'owner'
            )

            # Generate JWT token using Devise JWT
            token = user.generate_jwt

            render json: {
              user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                shop: {
                  id: shop.id,
                  name: shop.name
                }
              },
              token: token
            }, status: :created
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      def login
        user = User.find_by(email: params[:email])
        if user&.valid_password?(params[:password])
          # Generate JWT token using Devise JWT
          token = user.generate_jwt

          render json: {
            user: {
              id: user.id,
              email: user.email,
              full_name: user.full_name,
              shop: user.owned_shops.first&.as_json(only: [:id, :name])
            },
            token: token
          }
        else
          render json: { error: 'Invalid email or password' }, status: :unauthorized
        end
      end

      def me
        render json: {
          user: {
            id: current_user.id,
            email: current_user.email,
            full_name: current_user.full_name,
            shops: current_user.shops.map { |shop| 
              {
                id: shop.id,
                name: shop.name,
                role: shop.memberships.find_by(user: current_user).role
              }
            }
          }
        }
      end

      private

      def user_params
        params.require(:user).permit(:email, :password, :password_confirmation)
      end
    end
  end
end 