import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
# from django.contrib.auth import get_user_model # Removed module-level get_user_model

# User = get_user_model() # Removed module-level get_user_model

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        # Sanitize room name for channel layer group name
        self.room_group_name = f'chat_{self.room_name.replace(" ", "_")}'

        # User is now available from self.scope due to middleware
        if self.scope["user"].is_anonymous:
            # Optionally send a message to the client before closing
            # await self.send(text_data=json.dumps({
            #     'error': 'Authentication required.'
            # }))
            await self.close() # Just close if anonymous, don't send before accept
        else:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept() # Accept only if authenticated
            print(f"WebSocket connected for user: {self.scope['user'].username}") # Log successful connection


    async def disconnect(self, close_code):
        # Sanitize room name for channel layer group name
        self.room_group_name = f'chat_{self.room_name.replace(" ", "_")}'

        # User is still available in scope during disconnect
        if not self.scope["user"].is_anonymous:
             print(f"WebSocket disconnected for user: {self.scope['user'].username} with code: {close_code}")

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        user = self.scope["user"]
        message_content = data['message']

        # Ensure user is authenticated before saving
        if user.is_anonymous:
            # This case should ideally be handled by connect method closing the connection,
            # but added as a safeguard.
            print("Received message from anonymous user, ignoring.")
            return

        await self.save_message(user, self.room_name, message_content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_content,
                'username': user.username # Use username from the authenticated user
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username']
        }))

    @database_sync_to_async
    def save_message(self, user, room, content):
        # Import model here to avoid AppRegistryNotReady issue
        from .models import Message
        # Ensure room exists before creating message
        from .models import Room # Assuming Room model exists
        try:
            room_obj = Room.objects.get(name=room)
            Message.objects.create(user=user, room=room_obj, content=content)
        except Room.DoesNotExist:
            print(f"Room '{room}' does not exist, cannot save message.")