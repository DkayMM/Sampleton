"""
admin.py
--------
Registers the application's models with the Django admin site.

Each model registered here will appear as a manageable section within the
Django administration panel, allowing administrators to inspect, create,
edit, and delete records directly from the browser interface.
"""

from django.contrib import admin
from .models import UserProfile, Track, Comment, Like, Playlist, PlaylistTrack

admin.site.register(UserProfile)
admin.site.register(Track)
admin.site.register(Comment)
admin.site.register(Like)
admin.site.register(Playlist)
admin.site.register(PlaylistTrack)
