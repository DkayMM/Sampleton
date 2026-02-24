from django.contrib import admin
from .models import UserProfile, Track, Comment, Like, Playlist, PlaylistTrack

# Registramos cada tabla para que aparezca en el panel
admin.site.register(UserProfile)
admin.site.register(Track)
admin.site.register(Comment)
admin.site.register(Like)
admin.site.register(Playlist)
admin.site.register(PlaylistTrack)
