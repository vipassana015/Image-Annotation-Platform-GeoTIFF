"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from accounts.views import RegisterView, LoginView
from projects.views import ProjectListView, FileUploadView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from projects.views import MeView
from projects.views import ProjectDetailView
from projects.views import BatchListView
from projects.views import BatchFilesView
from projects.views import ProjectFilesView
from django.conf import settings
from django.conf.urls.static import static
from projects.views import UploadedFileDetailView



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
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/', MeView.as_view(), name='me'),
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


path('api/', include('projects.urls')),

path("projects/<int:project_id>/files/", ProjectFilesView.as_view()),

path(
    "api/uploaded-files/<int:pk>/",
    UploadedFileDetailView.as_view(),
),


]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )

