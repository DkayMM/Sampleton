from django.shortcuts import render
from rest_framework import viewsets
from .models import UserProfile, Track, Playlist, Comment, Like, PlaylistTrack
from .serializers import (
    UserProfileSerializer, 
    TrackSerializer, 
    PlaylistSerializer, 
    CommentSerializer, 
    LikeSerializer, 
    PlaylistTrackSerializer
)

# Vista para las Canciones
class TrackViewSet(viewsets.ModelViewSet):
    # Decimos qué datos coger de la base de datos
    queryset = Track.objects.all()
    
    # Decimos qué traductor usar
    serializer_class = TrackSerializer

# Vista para los Perfiles de Usuario
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

# Vista para las Playlists
class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer

# Vista para los Comentarios
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

# Vista para los Likes
class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer

# Vista para la relación entre Playlists y Tracks (el orden)
class PlaylistTrackViewSet(viewsets.ModelViewSet):
    queryset = PlaylistTrack.objects.all()
    serializer_class = PlaylistTrackSerializer
