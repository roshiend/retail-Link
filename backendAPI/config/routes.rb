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

      # Product routes (scoped to shops)
      resources :shops, only: [] do
        resources :products
      end
    end
  end
end
