from django.shortcuts import render, get_object_or_404, redirect
from .models import Message, Room

def home(request):
    return render(request, 'chat/home.html')

def room(request, room_name):
    messages = Message.objects.filter(room=room_name).order_by('timestamp')
    return render(request, 'chat/room.html', {
        'room_name': room_name,
        'messages': messages
    })

def chat_main(request, room_id=None):
    rooms = Room.objects.all().order_by('id')
    active_room = None
    messages = []
    if room_id:
        active_room = get_object_or_404(Room, id=room_id)
        messages = Message.objects.filter(room=active_room).order_by('timestamp')
    elif rooms:
        active_room = rooms.first()
        messages = Message.objects.filter(room=active_room).order_by('timestamp')
    context = {
        'rooms': rooms,
        'active_room': active_room,
        'messages': messages,
    }
    return render(request, 'chat/chat_main.html', context)

def redirect_to_main(request):
    return redirect('chat_main')