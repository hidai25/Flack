var socket;

document.addEventListener('DOMContentLoaded', () => {
  // Function to ask for a display name
  var display_name = localStorage.getItem("display_name");
  if (!display_name) {
    do {
      display_name = prompt("Please enter a display name", "Your display name");
      localStorage.setItem("display_name", display_name);
      document.querySelector("#display_name").innerHTML =
        "Hello " + localStorage.getItem('display_name') + "!" + " you are now connected to FLACK";
    }
    while (display_name === null || display_name === "Your display name" || display_name === "");
  } else {
    document.querySelector('#display_name').innerHTML =
      "Welcome back " + localStorage.getItem('display_name') + "!";
  }

  // Connect to websocket
  socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  // Define channel name and get it from local storage
  var channel_name = localStorage.getItem('channel_name');
  if (!channel_name) {
    ((document.querySelector("#if_not_chann").innerHTML = "Please Select a channel or create one and click on it!"));
  } else {
    askForChannelMsg(channel_name);
  }

  // By default send message button is disabled
  document.querySelector("#send_message").disabled = true;
  // Enable button only if there is text in the input field and a channel is selected
  document.querySelector("#msgs").onkeyup = () => {
    if (document.querySelector("#msgs").value.length > 0 && localStorage.getItem('channel_name')) {
      document.querySelector("#send_message").disabled = false;
    } else {
      document.querySelector("#send_message").disabled = true;
    }
  };

  // Send user input(messages) to the server with the name of the user and the time stamp of the message
  document.querySelector("#send_message").onclick = () => {
    // Define timestamp
    var d = new Date();
    var n = d.toLocaleTimeString();
    const message = document.querySelector("#msgs").value;
    // Send to message info to the server
    socket.emit("submit message", {
      "channel": localStorage.getItem('channel_name'),
      "message": message,
      "user": localStorage.getItem('display_name'),
      "timestamp": n
    });
  };

  // The display date part was taken from https://stackoverflow.com/questions/5214127/css-technique-for-a-horizontal-line-with-words-in-the-middle
  // Listen to the message information coming from the server and show it on the html tag
  socket.on("send message", data => {
    // Define the date part of the timestamp
    var m = new Date();
    var t = m.toLocaleDateString();
    const li = document.createElement('li');
    //Show user input message with his name and date
    li.innerHTML = "<span>" + `${data.user} ` + "</span>" + "<a>" + `${data.timestamp} ` + "</a>" + "<br />" + ` ${data.message}`;
    document.querySelector('#messages').append(li);
    // Clear field after clicking
    document.querySelector('#msgs').value = '';
    document.querySelector("#send_message").disabled = true;
    //set date
    document.querySelector("#date").innerHTML = t;
    document.querySelector('#show_date_style').style.display = "block";
    return false;
  });

  // By default create channel button is disabled
  document.querySelector("#channel_create").disabled = true;
  // Enable button only if there is text in the input field
  document.querySelector("#channel").onkeyup = () => {
    if (document.querySelector("#channel").value.length > 0)
      document.querySelector("#channel_create").disabled = false;
    else
      document.querySelector("#channel_create").disabled = true;
  };

  // Send channel creation name to the server
  document.querySelector("#channel_create").onclick = () => {
    const channel_name = document.querySelector("#channel").value;
    socket.emit("create channel", {
      "channel_name": document.querySelector("#channel").value
    });
  };

  // Keep the the channel creation announcer hidden by default
  document.querySelector('#update_chan_created').style.visibility = "hidden";

  socket.on("channel_taken", data => {
    // Listen to the information coming from the server and create channel if it doesn't exist already
    if (data == "Please use another channel name") {
      alert(data);
    } else {
      const li = document.createElement('li');
      li.innerHTML = `${data.channel_name}`;
      li.onclick = () => {
        // Get the channel name data and its information
        askForChannelMsg(`${data.channel_name}`);
      };
      document.querySelector('#channels').append(li);
      // Clear field after clicking
      document.querySelector('#msgs').value = '';
      // Disable create channel button again
      document.querySelector("#channel_create").disabled = true;

      // Show announcement to users on the page for 2 seconds
      document.querySelector("#update_chan_created").innerHTML = "Channel " + data["channel_name"] + " created successfully";

      if (document.querySelector('#update_chan_created').style.visibility === "visible") {
        setTimeout(function() {
          document.querySelector('#update_chan_created').style.visibility = "visible";
        }, 1500);
      } else {
        setTimeout(function() {
          document.querySelector('#update_chan_created').style.visibility = "hidden";
        }, 1500);
        document.querySelector('#update_chan_created').style.visibility = "visible";
      }
      // Clear input field
      document.querySelector('#channel').value = '';
      return false;
    }
  });
  // By default keep the "user is typing.."" field hidden
  document.querySelector("#updates").style.visibility = "hidden";
  socket.on("show user typing", data => {
    // If I am getting a message that I (myself) is typing so it wouldnt interest me
    //if(localStorage.getItem("display_name") != data["user"])
    document.querySelector("#updates").innerHTML = data["user"] + " is typing...";
    // If a user is typing so in this binary function it will be visible
    if (data["typing"] == '1') {
      document.querySelector("#updates").style.visibility = "visible";
    } else {
      document.querySelector("#updates").style.visibility = "hidden";
    }
  });

  socket.on("see_msg_channel", data => {
    // Get the info from the server of which channel the user wants see
    list_of_msg = data['list_of_msg'];
    channel_name = data['channel_name'];
    var m = new Date();
    var t = m.toLocaleDateString();
    if (!channel_name)
      return;
    // Store the current channel name in the browser's local storage
    localStorage.setItem('channel_name', channel_name);
    document.querySelector('#messages').innerHTML = "";
    // Extract the message data from the list and show it in the same way as it is when a user is typing
    for (i = 0; i < list_of_msg.length; i++) {
      const li = document.createElement('li');
      li.innerHTML = "<span>" + list_of_msg[i]['user'] + "</span>" + " " + "<a>" + list_of_msg[i]['timestamp'] + "</a>" + "<br />" + list_of_msg[i]['message'];
      document.querySelector('#messages').append(li);
      // Set date
      document.querySelector("#date").innerHTML = t;
      document.querySelector('#show_date_style').style.display = "block";
    }

    // Let the user know which channel he is connected to
    document.querySelector("#current_channel_conn").innerHTML = "You are currently connected to channel: " + data["channel_name"];
  });
});

function askForChannelMsg(channel) {
  if (localStorage.getItem('channel_name') == channel && document.querySelector("#messages").innerHTML != "")
    return;
  // Ask the server to join a new channel and see it
  document.querySelector("#messages").value = "";
  document.querySelector("#if_not_chann").innerHTML = "";
  socket.emit("see", {
    "channel_name": channel
  });
}

var lastUserTypingTime = null;

function user_typing() {
  // Function that asks to show the when the user is typing and in which channel
  socket.emit("user typing", {
    "channel": localStorage.getItem('channel_name'),
    "user": localStorage.getItem('display_name'),
    "typing": 1
  });

  lastUserTypingTime = Date.now();
  if (lastUserTypingTime != null)
    setTimeout(checkUserIsStillTyping, 1000);
}

function checkUserIsStillTyping() {
  // Function that calculates how long the user is typing
  currentTime = Date.now();
  if (currentTime - lastUserTypingTime > 2000) {
    socket.emit("user typing", {
      "channel": localStorage.getItem('channel_name'),
      "user": localStorage.getItem('display_name'),
      "typing": 0
    });
    lastUserTypingTime = null;
    return;
  }

  setTimeout(checkUserIsStillTyping, 1000);
}
