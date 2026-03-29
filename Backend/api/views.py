from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from .models import UserProfile, Track, Playlist, Comment, Like, PlaylistTrack
from .serializers import (
    UserProfileSerializer, 
    TrackSerializer, 
    PlaylistSerializer, 
    CommentSerializer, 
    LikeSerializer, 
    PlaylistTrackSerializer,
    RegisterSerializer
)
from .permissions import IsOwnerOrReadOnly

# Vista para los Tracks
class TrackViewSet(viewsets.ModelViewSet):
    # Decimos qué datos coger de la base de datos
    queryset = Track.objects.all()
    
    # Decimos qué traductor usar
    serializer_class = TrackSerializer
    
    # Debe estar logueado para crear, y ser el dueño para borrar/editar
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    # Cuando se sube un track, asigna al usuario del Token automáticamente
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Vista para los Perfiles de Usuario
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

# Vista para las Playlists
class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Vista para los Comentarios
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Vista para los Likes
class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Vista para la relación entre Playlists y Tracks (el orden)
class PlaylistTrackViewSet(viewsets.ModelViewSet):
    queryset = PlaylistTrack.objects.all()
    serializer_class = PlaylistTrackSerializer
    
# Vista para registrar usuarios nuevos
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,) # ¡Importante! Cualquiera debe poder registrarse sin estar logueado
    serializer_class = RegisterSerializer
