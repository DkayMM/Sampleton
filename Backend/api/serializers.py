"""
serializers.py
--------------
Defines the DRF serializers for the Sampleton API.

Each serializer is responsible for converting a model instance into a
JSON-compatible representation and for validating incoming request data
before it reaches the database. Read-only fields are marked explicitly
to prevent users from supplying or modifying sensitive values.
"""

from rest_framework import serializers
from .models import UserProfile, Track, Playlist, Comment, Like, PlaylistTrack
from django.contrib.auth.models import User


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserProfile model.

    Exposes profile fields alongside read-only data pulled directly from the
    related User instance (username and email). The 'user' foreign key and
    'role' field are explicitly set to read-only to prevent a user from
    assigning themselves elevated permissions through the API.

    Fields:
        id, user, username, email, avatar_file, display_name, bio, location, role.
    """

    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'username', 'email', 'avatar_file', 'display_name', 'bio', 'location', 'role']
        read_only_fields = ['user', 'role']


class TrackSerializer(serializers.ModelSerializer):
    """
    Serializer for the Track model.

    Exposes all track fields. The 'user' field is read-only because it is
    populated automatically from the authenticated request in the view layer,
    rather than being supplied by the client.

    Fields:
        All fields defined on the Track model.
    """

    class Meta:
        model = Track
        fields = '__all__'
        read_only_fields = ['user']


class PlaylistSerializer(serializers.ModelSerializer):
    """
    Serializer for the Playlist model.

    Exposes all playlist fields. The 'user' field is read-only and is set
    automatically to the authenticated user when a playlist is created.

    Fields:
        All fields defined on the Playlist model.
    """

    class Meta:
        model = Playlist
        fields = '__all__'
        read_only_fields = ['user']


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Comment model.

    Includes the 'username' field as an additional read-only property derived
    from the related User object. This allows the frontend to display the
    author's name without a separate API request. The 'user' field itself is
    read-only and is set from the request context in the view layer.

    Fields:
        All fields defined on the Comment model, plus 'username'.
    """

    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['user']


class LikeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Like model.

    Exposes all like fields. The 'user' field is read-only and is populated
    automatically from the authenticated request in the view layer.

    Fields:
        All fields defined on the Like model.
    """

    class Meta:
        model = Like
        fields = '__all__'
        read_only_fields = ['user']


class PlaylistTrackSerializer(serializers.ModelSerializer):
    """
    Serializer for the PlaylistTrack intermediary model.

    Exposes all fields, including the order position, the linked track, and
    the linked playlist. This serializer is used when adding or reordering
    tracks within a playlist.

    Fields:
        All fields defined on the PlaylistTrack model.
    """

    class Meta:
        model = PlaylistTrack
        fields = '__all__'


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for the user registration endpoint.

    Handles the creation of a new User account. The password field is marked
    as write-only so it is never returned in any API response. The create
    method delegates to Django's create_user helper, which handles password
    hashing automatically.

    Fields:
        username, email, password.
    """

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        """
        Creates and returns a new User with a securely hashed password.

        Uses Django's built-in create_user method instead of the standard
        create, ensuring that the password is never stored in plain text.

        Args:
            validated_data (dict): Validated data containing username, email,
                                   and raw password.

        Returns:
            User: The newly created User instance.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user