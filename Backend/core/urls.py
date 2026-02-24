from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # Los endpoints/rutas backend se gestionarán en api/urls.py
    
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Ruta para obtener token tras autenticarse.
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Ruta para refrescar token sin autenticarse nuevamente.
]

# Esto permite ver los archivos subidos (imágenes/audio) mientras desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
