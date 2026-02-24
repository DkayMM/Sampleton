from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para que solo los dueños de un objeto puedan editarlo.
    """
    def has_object_permission(self, request, view, obj):
        # Los permisos de lectura (GET, HEAD u OPTIONS) siempre se permiten.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Los permisos de escritura (PUT, PATCH, DELETE) solo se permiten al dueño.
        # Aquí 'obj.user' se refiere al campo 'user' del modelo Track/Playlist.
        return obj.user == request.user