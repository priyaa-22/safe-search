from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, LogoutView, CurrentUserView, ChangePasswordView

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth_login"),
    path("logout/", LogoutView.as_view(), name="auth_logout"),
    path("refresh/", TokenRefreshView.as_view(), name="auth_token_refresh"),
    path("me/", CurrentUserView.as_view(), name="auth_current_user"),
    path("change-password/", ChangePasswordView.as_view(), name="auth_change_password"),
]
