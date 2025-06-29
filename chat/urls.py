from django.urls import path
from . import views

urlpatterns = [
    path('', views.redirect_to_main, name='home'),
    path('chat/', views.chat_main, name='chat_main'),
    path('chat/<int:room_id>/', views.chat_main, name='chat_room'),
]