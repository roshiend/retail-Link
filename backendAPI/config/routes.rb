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
        resources :vendors do
          collection do
            post 'bulk_upload'
            post 'bulk_delete'
          end
        end

        # Product Type routes
        resources :product_types do
          collection do
            post 'bulk_upload'
            post 'bulk_delete'
          end
        end

        # Listing Type routes
        resources :listing_types do
          collection do
            post 'bulk_upload'
            post 'bulk_delete'
          end
        end

        # Shop Location routes
        resources :shop_locations do
          collection do
            post 'bulk_upload'
            post 'bulk_delete'
          end
        end

        # Category routes
        resources :categories do
          member do
            get 'subcategories'
          end
          collection do
            post 'bulk_upload'
            post 'bulk_delete'
          end
        end

        # Subcategory routes (nested under categories)
        resources :categories, only: [] do
          resources :subcategories do
            collection do
              post 'bulk_upload'
            end
          end
        end

        # Option Type Set routes
        resources :option_type_sets do
          collection do
            post 'bulk_upload'
            post 'bulk_delete'
          end
        end
      end
    end
  end
end
