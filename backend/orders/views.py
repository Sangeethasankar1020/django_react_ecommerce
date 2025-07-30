import stripe
import json
from decimal import Decimal
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.db import transaction
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer
from .tasks import send_order_confirmation_email
from .utils import generate_order_receipt_pdf
from django.db.models import Sum, Count
from datetime import timedelta
from django.utils import timezone

# Set Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Get payment method and validate Stripe payment if needed
            payment_method = request.data.get('payment_method')
            payment_intent_id = request.data.get('payment_intent_id')
            
            if payment_method == 'stripe':
                if not payment_intent_id:
                    return Response(
                        {'error': 'Payment Intent ID is required for Stripe payments'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Verify payment intent with Stripe
                try:
                    payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
                    
                    if payment_intent.status != 'succeeded':
                        return Response(
                            {'error': 'Payment not completed'}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Verify the payment amount matches the order total
                    # You'll need to calculate the order total here based on cart items
                    # This is a simplified version - adjust based on your cart logic
                    stripe_amount = Decimal(payment_intent.amount) / 100  # Convert from cents
                    
                    # Add payment_intent_id to the validated data
                    serializer.validated_data['payment_intent_id'] = payment_intent_id
                    serializer.validated_data['payment_status'] = 'paid'
                    
                except stripe.error.StripeError as e:
                    return Response(
                        {'error': f'Payment verification failed: {str(e)}'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            elif payment_method == 'mock':
                # For mock payments, mark as paid immediately
                serializer.validated_data['payment_status'] = 'paid'
            
            # Create the order
            order = serializer.save()
            
            # Send confirmation email
            send_order_confirmation_email.delay(order.id)

            # Custom response with order ID
            return Response(
                {
                    "message": "Order created successfully", 
                    "id": order.id,
                    "payment_status": order.payment_status
                },
                status=status.HTTP_201_CREATED
            )

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Create a Stripe Payment Intent"""
    try:
        data = request.data
        amount = data.get('amount')  # Amount in cents
        currency = data.get('currency', 'usd')
        description = data.get('description', 'E-commerce order')
        
        if not amount or amount <= 0:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(amount),
            currency=currency,
            description=description,
            metadata={
                'user_id': request.user.id,
                'user_email': request.user.email,
            }
        )
        
        return Response({
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id
        })
        
    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    """Cancel an order if it's still pending"""
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    if order.status not in ['pending', 'processing']:
        return Response({'error': 'Order cannot be cancelled'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Handle Stripe refund if it's a Stripe payment
    if order.payment_method == 'stripe' and order.payment_intent_id and order.payment_status == 'paid':
        try:
            # Create a refund in Stripe
            refund = stripe.Refund.create(
                payment_intent=order.payment_intent_id,
                reason='requested_by_customer'
            )
            
            if refund.status == 'succeeded':
                order.payment_status = 'refunded'
            else:
                return Response(
                    {'error': 'Refund failed. Please contact support.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except stripe.error.StripeError as e:
            return Response(
                {'error': f'Refund failed: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Restore stock
    for item in order.items.all():
        item.product.stock += item.quantity
        item.product.save()
    
    order.status = 'cancelled'
    order.save()
    
    return Response({'message': 'Order cancelled successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_receipt_pdf(request, order_id):
    """Generate and download PDF receipt for an order"""
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    pdf_buffer = generate_order_receipt_pdf(order)
    
    response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="order_{order.id}_receipt.pdf"'
    
    return response

# Admin views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders(request):
    """Get all orders for admin users"""
    if not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True,context={'request':request})
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_order_status(request, order_id):
    """Update order status (admin only)"""
    if not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    order = get_object_or_404(Order, id=order_id)
    new_status = request.data.get('status')
    
    if new_status not in dict(Order.STATUS_CHOICES):
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    order.status = new_status
    order.save()
    
    serializer = OrderSerializer(order)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stripe_webhook(request):
    """Handle Stripe webhooks for payment status updates"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)
    
    if not endpoint_secret:
        return Response({'error': 'Webhook secret not configured'}, status=400)
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        return Response({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError:
        return Response({'error': 'Invalid signature'}, status=400)
    
    # Handle different event types
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        
        # Find the corresponding order
        try:
            order = Order.objects.get(payment_intent_id=payment_intent['id'])
            order.payment_status = 'paid'
            order.save()
            
            # Send confirmation email if not already sent
            send_order_confirmation_email(order.id)
            
        except Order.DoesNotExist:
            pass  # Order might not be created yet
        
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        
        try:
            order = Order.objects.get(payment_intent_id=payment_intent['id'])
            order.payment_status = 'failed'
            order.save()
        except Order.DoesNotExist:
            pass
    
    return Response({'status': 'success'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, payment_intent_id):
    """Check payment status for a given payment intent"""
    try:
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        return Response({
            'status': payment_intent.status,
            'amount': payment_intent.amount,
            'currency': payment_intent.currency,
            'last_payment_error': payment_intent.last_payment_error
        })
        
    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_data(request):
    if not request.user.is_admin:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    # Total orders
    total_orders = Order.objects.count()

    # Total revenue (only paid orders)
    total_revenue = Order.objects.filter(payment_status='paid').aggregate(total=Sum('total_amount'))['total'] or 0

    # Pending orders count
    pending_orders = Order.objects.filter(status='pending').count()

    # Growth - comparing this week's orders to last week's
    now = timezone.now()
    this_week_orders = Order.objects.filter(created_at__gte=now - timedelta(days=7)).count()
    last_week_orders = Order.objects.filter(
        created_at__gte=now - timedelta(days=14),
        created_at__lt=now - timedelta(days=7)
    ).count()

    growth = 0
    if last_week_orders:
        growth = ((this_week_orders - last_week_orders) / last_week_orders) * 100
    elif this_week_orders > 0:
        growth = 100

    # Recent 5 orders
    recent_orders = Order.objects.order_by('-created_at')[:3]
    serializer = OrderSerializer(recent_orders, many=True)

    return Response({
        'total_orders': total_orders,
        'total_revenue': round(total_revenue, 2),
        'pending_orders': pending_orders,
        'growth': round(growth, 2),
        'recent_orders': serializer.data
    })