from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TrackViewSet, UserProfileViewSet, PlaylistViewSet, 
    CommentViewSet, LikeViewSet, PlaylistTrackViewSet,
    RegisterView, MyProfileView
)

# Creamos router para generar rutas dinámicamente (SOLO PARA VIEWSETS)
router = DefaultRouter()

router.register(r'tracks', TrackViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'playlists', PlaylistViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'likes', LikeViewSet)
router.register(r'playlists-tracks', PlaylistTrackViewSet)


urlpatterns = [
    # Las rutas endpoint generadas por el router
    path('', include(router.urls)),
    
    # Las rutas de vistas normales (APIViews) van aquí con path()
    path('register/', RegisterView.as_view(), name='auth_register'),
    
    # ✅ Añadimos tu vista de perfil aquí. 
    # Usamos 'profile/me/' para que coincida exactamente con lo que pide React
    path('profile/me/', MyProfileView.as_view(), name='my-profile'),
]