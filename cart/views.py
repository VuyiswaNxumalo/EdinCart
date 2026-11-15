from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product

from .models import Cart, CartItem
from .serializers import AddItemSerializer, CartSerializer, UpdateItemSerializer


def get_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


def cart_response(cart, code=status.HTTP_200_OK):
    return Response(CartSerializer(cart).data, status=code)


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return cart_response(get_cart(request.user))

    def delete(self, request):
        cart = get_cart(request.user)
        cart.items.all().delete()
        return cart_response(cart)


class CartItemAddView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AddItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = get_object_or_404(
            Product, pk=serializer.validated_data["product_id"], is_active=True
        )
        quantity = serializer.validated_data["quantity"]

        cart = get_cart(request.user)
        item = CartItem.objects.filter(cart=cart, product=product).first()
        new_quantity = (item.quantity if item else 0) + quantity

        if new_quantity > product.stock:
            return Response(
                {"detail": f"Only {product.stock} in stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if item:
            item.quantity = new_quantity
            item.save()
        else:
            CartItem.objects.create(cart=cart, product=product, quantity=quantity)
        return cart_response(cart, status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_item(self, request, pk):
        return get_object_or_404(CartItem, pk=pk, cart__user=request.user)

    def patch(self, request, pk):
        item = self.get_item(request, pk)
        serializer = UpdateItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quantity = serializer.validated_data["quantity"]

        if quantity > item.product.stock:
            return Response(
                {"detail": f"Only {item.product.stock} in stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        item.quantity = quantity
        item.save()
        return cart_response(item.cart)

    def delete(self, request, pk):
        item = self.get_item(request, pk)
        cart = item.cart
        item.delete()
        return cart_response(cart)
