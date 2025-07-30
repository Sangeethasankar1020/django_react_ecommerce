from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from products.models import Product

class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """Add item to cart or update quantity if item already exists"""
    cart, created = Cart.objects.get_or_create(user=request.user)
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity', 1))

    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    if quantity > product.stock:
        return Response({'error': 'Quantity exceeds available stock'}, status=status.HTTP_400_BAD_REQUEST)

    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': quantity}
    )

    if not created:
        new_quantity = cart_item.quantity + quantity
        if new_quantity > product.stock:
            return Response({'error': 'Total quantity exceeds available stock'}, status=status.HTTP_400_BAD_REQUEST)
        cart_item.quantity = new_quantity
        cart_item.save()

    serializer = CartItemSerializer(cart_item)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    """Update cart item quantity"""
    cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    quantity = int(request.data.get('quantity', 1))

    if quantity <= 0:
        cart_item.delete()
        return Response({'message': 'Item removed from cart'}, status=status.HTTP_200_OK)

    if quantity > cart_item.product.stock:
        return Response({'error': 'Quantity exceeds available stock'}, status=status.HTTP_400_BAD_REQUEST)

    cart_item.quantity = quantity
    cart_item.save()

    serializer = CartItemSerializer(cart_item)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    """Remove item from cart"""
    cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    cart_item.delete()
    return Response({'message': 'Item removed from cart'}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    """Clear all items from cart"""
    cart = get_object_or_404(Cart, user=request.user)
    cart.items.all().delete()
    return Response({'message': 'Cart cleared'}, status=status.HTTP_200_OK)