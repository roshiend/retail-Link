Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

  namespace :api do
    namespace :v1 do
      # Auth routes
      post 'signup', to: 'auth#signup'
      post 'login', to: 'auth#login'
      get 'me', to: 'auth#me'

      # Shop routes
      resources :shops, only: [:index, :create] do
        member do
          post 'invite'
        end
      end

      # Shop-scoped resources
      resources :shops, only: [] do
        # Product routes
        resources :products do
          collection do
            post 'bulk_delete'
          end
          
          # Option Type routes (nested under products)
          resources :option_types
        end

        # Vendor routes
        resources :vendors

        # Product Type routes
        resources :product_types

        # Listing Type routes
        resources :listing_types

        # Shop Location routes
        resources :shop_locations

        # Category routes
        resources :categories do
          member do
            get 'subcategories'
          end
        end

        # Subcategory routes (nested under categories)
        resources :categories, only: [] do
          resources :subcategories
        end

        # Option Type Set routes
        resources :option_type_sets
      end
    end
  end
end
