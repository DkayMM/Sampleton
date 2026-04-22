from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

# 🚨 AÑADIMOS EL 'basename' A LAS RUTAS QUE HEMOS BLINDADO POR SEGURIDAD
router.register(r'tracks', TrackViewSet, basename='track')
router.register(r'playlists', PlaylistViewSet, basename='playlist')
router.register(r'comments', CommentViewSet, basename='comment')

# El resto de rutas normales
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'playlists-tracks', PlaylistTrackViewSet, basename='playlist-track')
router.register(r'likes', LikeViewSet, basename='like')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/me/', MyProfileView.as_view(), name='my-profile'),
]