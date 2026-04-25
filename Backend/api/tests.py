import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import Track, Playlist, PlaylistTrack, UserProfile, Like
from django.core.files.uploadedfile import SimpleUploadedFile

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user():
    user = User.objects.create_user(username='testuser', password='testpassword123', email='test@test.com')
    return user

@pytest.fixture
def auth_client(test_user):
    client = APIClient()
    response = client.post('/api/token/', {'username': 'testuser', 'password': 'testpassword123'}, format='json')
    token = response.data['access']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return client

@pytest.mark.django_db
class TestAuthAndProfile:
    def test_register_user(self, api_client):
        data = {'username': 'newuser', 'password': 'newpassword123', 'email': 'new@test.com'}
        response = api_client.post('/api/register/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(username='newuser').exists()

    def test_login_user(self, api_client, test_user):
        data = {'username': 'testuser', 'password': 'testpassword123'}
        response = api_client.post('/api/token/', data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_get_profile(self, auth_client, test_user):
        response = auth_client.get('/api/profile/me/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == 'testuser'

@pytest.mark.django_db
class TestTracks:
    def test_upload_track(self, auth_client, test_user):
        audio_content = b'fake_audio_data'
        audio_file = SimpleUploadedFile("test.mp3", audio_content, content_type="audio/mpeg")
        
        data = {
            'title': 'Test Track',
            'artist': 'Test Artist',
            'audio_file': audio_file,
            'is_public': True
        }
        response = auth_client.post('/api/tracks/', data, format='multipart')
        assert response.status_code == status.HTTP_201_CREATED
        assert Track.objects.count() == 1
        assert Track.objects.first().title == 'Test Track'

    def test_get_tracks(self, api_client, test_user):
        Track.objects.create(title="Track 1", artist="Artist 1", user=test_user, is_public=True, audio_file='test.mp3')
        response = api_client.get('/api/tracks/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

@pytest.mark.django_db
class TestPlaylists:
    def test_create_playlist(self, auth_client, test_user):
        data = {'title': 'My Playlist', 'is_public': True}
        response = auth_client.post('/api/playlists/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert Playlist.objects.count() == 1
        assert Playlist.objects.first().title == 'My Playlist'

    def test_add_track_to_playlist(self, auth_client, test_user):
        track = Track.objects.create(title="Track 1", artist="Artist 1", user=test_user, is_public=True, audio_file='test.mp3')
        playlist = Playlist.objects.create(title="My Playlist", user=test_user, is_public=True)
        
        data = {'playlist': playlist.id, 'track': track.id, 'order': 1}
        response = auth_client.post('/api/playlists-tracks/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert PlaylistTrack.objects.count() == 1

@pytest.mark.django_db
class TestLikes:
    def test_like_track(self, auth_client, test_user):
        track = Track.objects.create(title="Track 1", artist="Artist 1", user=test_user, is_public=True, audio_file='test.mp3')
        data = {'track': track.id}
        response = auth_client.post('/api/likes/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert Like.objects.count() == 1

    def test_unlike_track(self, auth_client, test_user):
        track = Track.objects.create(title="Track 1", artist="Artist 1", user=test_user, is_public=True, audio_file='test.mp3')
        like = Like.objects.create(track=track, user=test_user)
        response = auth_client.delete(f'/api/likes/{like.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Like.objects.count() == 0
