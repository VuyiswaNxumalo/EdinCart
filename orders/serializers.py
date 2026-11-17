from datetime import date

from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = OrderItem
        fields = ("id", "product", "product_name", "unit_price", "quantity", "subtotal")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id", "status", "total", "shipping_address",
            "payment_reference", "created_at", "items",
        )


class CheckoutSerializer(serializers.Serializer):
    shipping_address = serializers.CharField(max_length=500)


class PaySerializer(serializers.Serializer):
    card_number = serializers.CharField()
    exp_month = serializers.IntegerField(min_value=1, max_value=12)
    exp_year = serializers.IntegerField(min_value=2000, max_value=2100)
    cvc = serializers.CharField(min_length=3, max_length=4)

    def validate_card_number(self, value):
        digits = value.replace(" ", "").replace("-", "")
        if not digits.isdigit() or not 13 <= len(digits) <= 19:
            raise serializers.ValidationError("Enter a valid card number.")
        return digits

    def validate(self, data):
        today = date.today()
        if (data["exp_year"], data["exp_month"]) < (today.year, today.month):
            raise serializers.ValidationError("This card has expired.")
        return data
