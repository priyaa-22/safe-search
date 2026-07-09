from django.contrib import admin
from django.urls import path, include
from accounts.views import UserManagementView, UserDetailView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/users/", UserManagementView.as_view(), name="user_management"),
    path("api/users/<int:pk>/", UserDetailView.as_view(), name="user_detail"),
    path("api/", include("documents.urls")),
]
