from django.urls import path

from .views import CheckoutView, OrderDetailView, OrderListView, PayView

urlpatterns = [
    path("", OrderListView.as_view()),
    path("checkout/", CheckoutView.as_view()),
    path("<int:pk>/", OrderDetailView.as_view()),
    path("<int:pk>/pay/", PayView.as_view()),
]
