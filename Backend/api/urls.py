"""
urls.py (api)
-------------
Defines the URL routing for the Sampleton REST API.

All API endpoints are registered here using DRF's DefaultRouter, which
automatically generates the standard set of routes (list, detail, create,
update, destroy) for each registered ViewSet.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

# ViewSets with custom queryset logic require an explicit basename so that
# DRF can generate URL names correctly without relying on the model attribute.
router.register(r'tracks', TrackViewSet, basename='track')
router.register(r'playlists', PlaylistViewSet, basename='playlist')
router.register(r'comments', CommentViewSet, basename='comment')

# Standard ViewSets with a fixed queryset do not strictly need a basename,
# but one is provided for consistency across all registered routes.
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'playlists-tracks', PlaylistTrackViewSet, basename='playlist-track')
router.register(r'likes', LikeViewSet, basename='like')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/me/', MyProfileView.as_view(), name='my-profile'),
]