class ApplicationController < ActionController::API
  include ActionController::MimeResponds
  include ActionController::ImplicitRender
  include ActionController::StrongParameters
  
  before_action :set_cors_headers
  before_action :authenticate_user!
  respond_to :json

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
end
