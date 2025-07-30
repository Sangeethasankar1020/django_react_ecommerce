from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('', views.ProductListCreateView.as_view(), name='product-list-create'),
    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('featured/', views.featured_products, name='featured-products'),
    path('my-products/', views.my_products, name='my-products'),
]