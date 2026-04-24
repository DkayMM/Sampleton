from rest_framework import viewsets, generics, permissions
from .models import Track, UserProfile, Playlist, Comment, Like, PlaylistTrack
from django.contrib.auth.models import User
from .serializers import *

class TrackViewSet(viewsets.ModelViewSet):
    serializer_class = TrackSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 

    def get_queryset(self):
        action = getattr(self, 'action', None)
        if action in ['destroy', 'update', 'partial_update']:
            return Track.objects.filter(user=self.request.user)
        return Track.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PlaylistViewSet(viewsets.ModelViewSet):
    serializer_class = PlaylistSerializer

    def get_permissions(self):
        if self.action in ['retrieve', 'list']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.action in ['list']:
            user = self.request.user
            if user.is_authenticated:
                from django.db.models import Q
                return Playlist.objects.filter(Q(user=user) | Q(is_public=True))
            return Playlist.objects.filter(is_public=True)
        return Playlist.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        serializer.save()

class MyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def get_queryset(self):
        queryset = Comment.objects.all().order_by('-posted_at')
        request = getattr(self, 'request', None)
        track_id = request.query_params.get('track') if request else None
        if track_id:
            queryset = queryset.filter(track_id=track_id)
        return queryset
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LikeViewSet(viewsets.ModelViewSet):
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Like.objects.all()
        request = getattr(self, 'request', None)
        track_id = request.query_params.get('track') if request else None
        if track_id:
            return queryset.filter(track_id=track_id)
            
        if request and request.user.is_authenticated:
            return queryset.filter(user=request.user)
            
        return queryset.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

class PlaylistTrackViewSet(viewsets.ModelViewSet):
    queryset = PlaylistTrack.objects.all()
    serializer_class = PlaylistTrackSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer