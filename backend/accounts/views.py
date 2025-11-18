from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .serializers import UserSerializer
from django.contrib.auth.models import User

# Signup
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Login
from rest_framework.views import APIView

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            return Response({"message": "Login successful", "user_id": user.id})
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
