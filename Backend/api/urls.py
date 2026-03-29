from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TrackViewSet, UserProfileViewSet, PlaylistViewSet, 
    CommentViewSet, LikeViewSet, PlaylistTrackViewSet,
    RegisterView
)

# Creamos router para generar rutas dinámicamente
router = DefaultRouter()

# Registramos los ViewSets que usará el router
router.register(r'tracks', TrackViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'playlists', PlaylistViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'likes', LikeViewSet)
router.register(r'playlists-tracks', PlaylistTrackViewSet)


urlpatterns = [
    # Las rutas endpoint son las generadas por el router en base a los ViewSets definidos
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='auth_register'),
]