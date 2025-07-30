from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListView.as_view(), name='order-list'),
    path('create/', views.OrderCreateView.as_view(), name='order-create'),
    path('<uuid:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('<uuid:order_id>/cancel/', views.cancel_order, name='cancel-order'),
    path('<uuid:order_id>/receipt-pdf/', views.order_receipt_pdf, name='order-receipt-pdf'),
    # Stripe payment endpoints
    path('create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('stripe-webhook/', views.stripe_webhook, name='stripe-webhook'),
    path('payment-status/<str:payment_intent_id>/', views.payment_status, name='payment-status'),
    # Admin endpoints
    path('admin/all/', views.admin_orders, name='admin-orders'),
    path('admin/<uuid:order_id>/status/', views.admin_update_order_status, name='admin-update-order-status'),
    path('admin/dashboard-data/', views.admin_dashboard_data, name='admin-dashboard-data'),

]