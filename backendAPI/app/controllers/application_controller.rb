class ApplicationController < ActionController::API
  include ActionController::MimeResponds
  include ActionController::ImplicitRender
  include ActionController::StrongParameters
  include Devise::Controllers::Helpers
  
  before_action :set_cors_headers
  before_action :authenticate_user!
  respond_to :json

  def current_user
    @current_user ||= User.find_by(id: decoded_token['id']) if decoded_token
  end

  private

  def set_cors_headers
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, X-Requested-With'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Max-Age'] = '86400'
  end

  def handle_options_request
    head :ok if request.method == 'OPTIONS'
  end

  def render_error(status, message)
    render json: { error: message }, status: status
  end

  def authenticate_user!
    unless current_user
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  def decoded_token
    header = request.headers['Authorization']
    return nil unless header

    token = header.split(' ').last
    begin
      JWT.decode(token, Rails.application.credentials.devise_jwt_secret_key!, true, algorithm: 'HS256').first
    rescue JWT::DecodeError
      nil
    end
  end
end
