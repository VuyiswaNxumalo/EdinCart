from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import Cart
from products.models import Product

from .models import Order, OrderItem, Payment
from .payments import charge
from .serializers import CheckoutSerializer, OrderSerializer, PaySerializer


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart, _ = Cart.objects.get_or_create(user=request.user)

        with transaction.atomic():
            cart_items = list(cart.items.select_related("product"))
            if not cart_items:
                return Response(
                    {"detail": "Your cart is empty."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            products = {
                p.id: p
                for p in Product.objects.select_for_update().filter(
                    id__in=[i.product_id for i in cart_items]
                )
            }

            for item in cart_items:
                product = products[item.product_id]
                if not product.is_active or item.quantity > product.stock:
                    return Response(
                        {"detail": f"Not enough stock for {product.name}."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            total = sum(
                (products[i.product_id].price * i.quantity for i in cart_items),
                Decimal("0.00"),
            )
            order = Order.objects.create(
                user=request.user,
                total=total,
                shipping_address=serializer.validated_data["shipping_address"],
            )

            for item in cart_items:
                product = products[item.product_id]
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    unit_price=product.price,
                    quantity=item.quantity,
                )
                product.stock -= item.quantity
                product.save(update_fields=["stock"])

            cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class PayView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        serializer = PaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            order = get_object_or_404(
                Order.objects.select_for_update(), pk=pk, user=request.user
            )
            if order.status != Order.Status.PENDING:
                return Response(
                    {"detail": "This order is not awaiting payment."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            result = charge(serializer.validated_data["card_number"], order.total)
            Payment.objects.create(
                order=order,
                amount=order.total,
                status=(
                    Payment.Status.SUCCEEDED if result.success else Payment.Status.FAILED
                ),
                reference=result.reference,
            )

            if not result.success:
                return Response(
                    {"detail": result.message},
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )

            order.status = Order.Status.PAID
            order.payment_reference = result.reference
            order.save(update_fields=["status", "payment_reference"])

        return Response(OrderSerializer(order).data)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")
