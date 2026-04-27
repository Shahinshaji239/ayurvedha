import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Appointment, ChatMessage


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.appointment_id = self.scope['url_route']['kwargs']['appointment_id']
        self.room_group_name = f'chat_{self.appointment_id}'

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Send message history to the newly connected client
        history = await self.get_history()
        for msg in history:
            await self.send(text_data=json.dumps({
                'message': msg['message'],
                'sender': msg['sender_role'],
                'time': msg['time'],
                'from_history': True
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        sender_role = data['sender']
        time = data['time']

        # Persist to DB
        await self.save_message(sender_role, message)

        # Broadcast to all in group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender_role,
                'time': time,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'time': event['time'],
        }))

    # ─── DB helpers ──────────────────────────────────────────────────

    @database_sync_to_async
    def save_message(self, sender_role, message):
        try:
            appointment = Appointment.objects.get(id=self.appointment_id)
            ChatMessage.objects.create(
                appointment=appointment,
                sender_role=sender_role,
                message=message,
            )
        except Appointment.DoesNotExist:
            pass

    @database_sync_to_async
    def get_history(self):
        try:
            messages = ChatMessage.objects.filter(
                appointment_id=self.appointment_id
            ).order_by('timestamp')
            return [
                {
                    'message': m.message,
                    'sender_role': m.sender_role,
                    'time': m.timestamp.strftime('%H:%M'),
                }
                for m in messages
            ]
        except Exception:
            return []
