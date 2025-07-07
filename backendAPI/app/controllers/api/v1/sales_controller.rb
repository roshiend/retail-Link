module Api
  module V1
    class SalesController < BaseController
      def index
        # Mock sales data for now - replace with actual sales logic
        sales_data = {
          today: 1250.50,
          yesterday: 980.25,
          this_week: 8750.75,
          last_week: 7200.00,
          change: 21.5
        }
        
        render json: sales_data
      end
    end
  end
end 