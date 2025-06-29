from django.shortcuts import render
from .models import Message

def home(request):
    return render(request, 'chat/home.html')

def room(request, room_name):
    messages = Message.objects.filter(room=room_name).order_by('timestamp')
    return render(request, 'chat/room.html', {
        'room_name': room_name,
        'messages': messages
    })