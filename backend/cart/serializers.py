from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductListSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'total_price', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        product_id = attrs.get('product_id')
        quantity = attrs.get('quantity', 1)
        
        try:
            from products.models import Product
            product = Product.objects.get(id=product_id, is_active=True)
            if quantity > product.stock:
                raise serializers.ValidationError("Quantity exceeds available stock")
            attrs['product'] = product
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found or inactive")
        
        return attrs

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'total_items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']