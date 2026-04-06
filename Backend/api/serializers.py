from rest_framework import serializers
from .models import UserProfile, Track, Playlist, Comment, Like, PlaylistTrack
from django.contrib.auth.models import User

# Traductor de perfiles
class UserProfileSerializer(serializers.ModelSerializer):
    # Traemos datos del User original (Solo Lectura)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta: 
        model = UserProfile
        fields = ['id', 'user', 'username', 'email', 'avatar_file', 'display_name', 'bio', 'location', 'role']
        read_only_fields = ['user', 'role'] # Evitamos que el usuario se cambie a sí mismo a 'Admin' hackeando la web
  
# Traductor de tracks 
class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = '__all__'
        read_only_fields = ['user']

# Traductor de playlists
class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = '__all__'
        
# Traductor de comentarios
class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'

# Traductor de likes
class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'

# Traductor de playlist order
class PlaylistTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistTrack
        fields = '__all__'
        
class RegisterSerializer(serializers.ModelSerializer):
    # Esto asegura que la contraseña no se devuelva nunca al leer datos por seguridad
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        # 'create_user' es una magia de Django que encripta la contraseña automáticamente
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user