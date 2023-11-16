# Project 2

Web Programming with Python and JavaScript

In my project I answered all the requirement as requested on the project's specification. I chose to prompt the user for a display name with a prompt window and blocked all the events (like an empty display name or cancel of the prompt) that I as a developer wouldn't want the user to get to. Later on, the user lands on the chat page which I did as a single page with only one route. The user is either welcomed if he is a new user or he gets a "welcome back" announcement if the display name is in the local storage already. The user is told then to create or pick a channel and also the option to chat while he is not connected to a channel is blocked. Once the user has created a channel, it appears on a list on the side nav-bar and it is also seen live, without reloading, by all the app's users via the socket. A small message above the chat input box appears for 1.5 seconds telling the user a chat was created successfully and is broadcasted to the users( which is a part of my personal touch requirement). Once the user has connected to the a channel he is able to chat on it and to view live what other users say and he also see the 100 most recent messages on that channel. The user sees his and every users name and time stamp of the message as well as the current date on top of chat. The second part of my personal touch is the message "user is typing..." and when he is it appears above the chat box and is broadcasted to all the users via the socket. For purposes of verifying this works I left line 134 in the index.js file commented out and then you can see when you are typing this message. Otherwise, it is not interesting for the user to know when he is typing of course. Later on, the user is also able to see which channel he is connected to on the top of the page which is also something I added in extra of the requirements. If the user closes the browser and opens it again he will remain in the same channel he was at previously and he will see all the messages that were sent while he was not there (last 100 of them).
I Tested all the feutures detailed above on google chrome and they all worked nicely. For purposes of testing I reset to 0 the local storage each time I did the tests. I added some CSS designs to the chat page as well as to the chat messages to get a nicer look and feel.
There are 6 files for this project: two static files(index.js, styles.css), one template(index.html),  application.py, requirements.txt and this README.md file.

If you have any questions about my project feel free to ask.

Best regards,

Hidai Bar-Mor