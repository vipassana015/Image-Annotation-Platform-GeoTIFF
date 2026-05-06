from django.urls import path
from rest_framework.routers import DefaultRouter
from .views_annotations import ClassLabelViewSet, AnnotationViewSet
from .views import *

router = DefaultRouter()
router.register(r'class-labels', ClassLabelViewSet, basename='class-label')
router.register(r'annotations', AnnotationViewSet, basename='annotation')

urlpatterns = router.urls  # 👈 FIRST

# 👇 THEN EXTEND (NOT override)
urlpatterns += [
    path('datasets/<int:dataset_id>/export/', DatasetExportView.as_view()),

    path('datasets/', get_datasets),
    path('datasets/create/', create_dataset),
    path('dataset-images/', add_image_to_dataset),
    path('datasets/<int:dataset_id>/images/', get_dataset_images),
    path('datasets/<int:dataset_id>/images/<int:image_id>/remove/',remove_image_from_dataset),
    path('datasets/<int:dataset_id>/delete/', DeleteDatasetView.as_view()),

    path('projects/<int:project_id>/members/', ProjectMembersView.as_view()),
    path('projects/<int:project_id>/members/add/', AddProjectMemberView.as_view()),
    path('projects/<int:project_id>/members/remove/<int:user_id>/', RemoveProjectMemberView.as_view()),
    path('projects/<int:project_id>/members/<int:user_id>/role/', UpdateMemberRoleView.as_view()),
    path('projects/<int:project_id>/delete/', DeleteProjectView.as_view()),

    path('projects/owned/', OwnedProjectsView.as_view()),
    path('projects/shared/', SharedProjectsView.as_view()),
    path('projects/recent/', RecentProjectsView.as_view()),

    path("activity/", ActivityListView.as_view()),
    path("notifications/", NotificationListView.as_view()),
    path("notifications/<int:notification_id>/read/", MarkNotificationReadView.as_view()),
    path("notifications/read-all/", MarkAllNotificationsReadView.as_view()),
    path('images/<int:image_id>/delete/', DeleteImageView.as_view()),
    path('projects/trash/', TrashedProjectsView.as_view(), name='trash-list'),
    path('projects/<int:project_id>/trash/', TrashProjectView.as_view(), name='trash-project'),
    path('projects/<int:project_id>/restore/', RestoreProjectView.as_view(), name='restore-project'),
    path('projects/<int:project_id>/permanent-delete/', PermanentDeleteProjectView.as_view(), name='permanent-delete-project'),
    path('batches/<int:batch_id>/delete/', DeleteBatchView.as_view()),
]