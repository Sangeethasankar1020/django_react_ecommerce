from rest_framework import permissions

class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admin users to edit it.
    Read permissions are allowed to any authenticated user.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner or admin users
        return obj.created_by == request.user or request.user.is_admin