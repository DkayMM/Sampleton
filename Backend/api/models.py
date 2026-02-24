from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    
    # Solo un perfil por usuario.
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    avatar_file=models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # CONSTANTES DE ROLES
    ROLE_CHOICES = (
        ('User', 'Normal user'),
        ('Admin', 'Administrator')
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='User')
    
    def __str__(self):
        return f"Perfil de {self.user.username}"

class Track(models.Model):
    
    title = models.CharField(max_length=200)
    audio_file = models.FileField(upload_to='tracks/')
    duration = models.IntegerField(default=0)
    play_count = models.IntegerField(default=0)
    is_public = models.BooleanField(default=True)
    upload_date = models.DateTimeField(auto_now_add=True) # auto_now_add guarda la hora de subida basado en reloj del servidor.
    genre = models.CharField(max_length=50, blank=True) # blank = true hace que sea opcional este campo.
    
    # Foreign Key Relationship
    user = models.ForeignKey(User, on_delete=models.CASCADE) # Esto último hace que si el usuario es baneado, todas sus subidas se borran en cascada.
    
    # Hace que en el panel de admin los tracks aparezcan por su title.
    def __str__(self):
        return self.title

class Comment(models.Model):
    
    # Foreign Key Relationships
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    content = models.TextField()
    posted_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Comentario de {self.user.username}"

class Like(models.Model):
    
    # Foreign Key Relationships
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    liked_at = models.DateTimeField(auto_now_add=True)
    
    # Sólo un Like por persona y por track.
    class Meta:
        unique_together = ('user', 'track')
    
    def __str__(self):
        return f"A {self.user.username} le gusta {self.track.title}"

class Playlist(models.Model):
    
    # Foreign Key Relationships
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    title = models.CharField(max_length=200)
    is_public = models.BooleanField(default=True)

    # Para conectar con la tabla Track a través de la tabla PlaylistTrack
    tracks = models.ManyToManyField(Track, through='PlaylistTrack')
    
    def __str__(self):
        return self.title
    
class PlaylistTrack(models.Model):
    
    # Foreign Key Relationships
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
    
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order'] # Tracks ordenados de menor a mayor.
    
    def __str__(self):
        return f"{self.playlist.title} - {self.track.title} #{self.order}"

    
    
    
    
        
        
    
    
    
    
    