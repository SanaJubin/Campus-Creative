from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'profiles', views.StudentProfileViewSet, basename='profile')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'categories', views.CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.register_user, name='register'),
]