from rest_framework import serializers
from .models import Order, OrderItem
from cart.models import Cart, CartItem
from products.serializers import ProductListSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'total_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user_email', 'status', 'payment_status', 'total_amount','payment_intent_id',
            'shipping_address', 'payment_method', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at','user_email']

class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['shipping_address', 'payment_method','payment_intent_id']
    def validate(self, data):
        """Validate order data"""
        user = self.context['request'].user
        
        # Check if user has items in cart
        try:
            cart = Cart.objects.get(user=user)
            if not cart.items.exists():
                raise serializers.ValidationError("Cart is empty")
        except Cart.DoesNotExist:
            raise serializers.ValidationError("Cart not found")
        
        # Validate payment method
        if data['payment_method'] == 'stripe' and not data.get('payment_intent_id'):
            raise serializers.ValidationError({
                'payment_intent_id': 'Payment Intent ID is required for Stripe payments'
            })
        
        return data
    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        print(user)
        print(user.cart)
        # Get user's cart
        try:
            cart = user.cart
        except:
            raise serializers.ValidationError("Cart is empty")
        
        if not cart.items.exists():
            raise serializers.ValidationError("Cart is empty")
        
        # Calculate total amount
        total_amount = cart.total_price
        
        # Create order
        order = Order.objects.create(
            user=user,
            total_amount=total_amount,
            **validated_data
        )
        
        # Create order items and reduce stock
        for cart_item in cart.items.all():
            if not cart_item.product.reduce_stock(cart_item.quantity):
                raise serializers.ValidationError(f"Insufficient stock for {cart_item.product.name}")
            
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
        
        # Clear cart
        cart.items.all().delete()
        
        return order