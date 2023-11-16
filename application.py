import os
from flask import render_template
from flask import Flask, request, redirect, url_for
import random
from datetime import datetime
from flask_socketio import SocketIO, emit, join_room
import time

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY")
socketio = SocketIO(app)

# keep the channels in a dictionary
channels = {}


@app.route("/")
# Return index by default rendering the channels in it(if they exist)
def index():
    return render_template("index.html", channels=channels.keys())


@socketio.on("submit message")
# Responsible for getting the message data via the socket and transmitting it to the specific channel
def messaging(data):
    # Define all the needed variables for messaging display
    message = data["message"]
    user = data["user"]
    timestamp = data["timestamp"]
    channel = data["channel"]
    channels[channel].append(data)
    # Show the last 100 messages in the channel
    if len(channels[channel]) > 99:
        current_list_of_msg = channels[channel]
        first_msg = current_list_of_msg[0]
        channels[channel].remove(first_msg)
    emit("send message", {"message": message, "user": user, "timestamp": timestamp}, room=channel, broadcast=True)


@socketio.on("create channel")
# Responsible for channel creation
def channel(data):
    channel_name = data["channel_name"]
    # Make sure the channel name entered doesn't conflict with name of and existing one
    if channel_name in channels.keys():
        emit("channel_taken", "Please use another channel name")
    else:
        # When creating new channel you create a new list for future messages
        channels[channel_name] = []
        emit("channel_taken", {"channel_name": channel_name}, broadcast=True)


@socketio.on("see")
# Responsible for viewing the channel and its messages
def channel_view(data):
    channel = data["channel_name"]
    join_room(channel)
    # The list of messages variable contains all the message data needed which is gonna be extracted in the javascript file
    list_of_msg = channels[channel]
    emit("see_msg_channel",  {"list_of_msg": list_of_msg, "channel_name": channel})


@socketio.on("user typing")
# Responsible for notifying the user when a user in the channel is typing a message
def user_typing(data):
    # Define all the variables needed for the function
    user = data['user']
    room = data['channel']
    typing = data['typing']
    emit("show user typing", {"user": user, "typing": typing}, room=room, broadcast=True)

    if __name__ == '__main__':
        socketio.run(app)
