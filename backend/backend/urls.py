from django.contrib import admin
from django.urls import path, include
from accounts.views import RegisterView, LoginView
from projects.views import (
    ProjectListView,
    FileUploadView,
    MeView,
    ProjectDetailView,
    BatchListView,
    BatchFilesView,
    ProjectFilesView,
    UploadedFileDetailView,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/signup/', RegisterView.as_view(), name="signup"),
    path('api/login/', LoginView.as_view(), name="login"),

    path('api/projects/', ProjectListView.as_view(), name='projects'),

    path(
        'api/projects/<int:project_id>/upload/',
        FileUploadView.as_view(),
        name='file-upload'
    ),

    path(
        'api/projects/<int:pk>/',
        ProjectDetailView.as_view(),
        name='project-detail'
    ),

    path(
        "api/projects/<int:project_id>/batches/",
        BatchListView.as_view(),
        name="project-batches",
    ),

    path(
        "api/projects/<int:project_id>/batches/<int:batch_id>/files/",
        BatchFilesView.as_view(),
    ),

    path(
        "api/projects/<int:project_id>/files/",
        ProjectFilesView.as_view(),
    ),

    path(
        "api/uploaded-files/<int:pk>/",
        UploadedFileDetailView.as_view(),
    ),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    path(
        'api/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),

    path('api/me/', MeView.as_view(), name='me'),

    path('api/', include('projects.urls')),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )