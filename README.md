# Documentation web_chat
## Short Summary
Web_chat is an online chat application. The backend is written in __Node.js__ with the help of the __express frameworks__ and of course some other aswell. <br>
The frontend is handcrafted with the __google material design specifications__ in mind. Also, no fancy frontend frameworks were used <br>
It is __user based.__ At the time of writing this, the chatting is only possible in chat rooms -> No private chats. The chatrooms are however __secured via a password.__ So you could theoretically chat private if you'd only share the key for a certain room with a certain person. I do __plan on implementing private chats in the near future.__ <br>
Message distribution in the chat rooms is handled via websockets.

## Key Features
### Frontend
- Creating a user
   * Client side input validation
- Logging in with your user credentials
- Receiving all chat rooms
- Creating a chat room
   * Client side validation of input
- Joining one or multiple chat rooms if the correct key was entered
- Displaying all participants with their username and profile picture in a chat room after joining that specific room.
- Establishing a websocket connection to the server
- Sending a message to all the participants in a room
- Receiving all messages of the participants in the room after the join.
- Closing the tab with the active chat room session and reopening that tab and being reconnected to that room without entering the password once again

### Backend
- Creating a user in the Mysql database
   * Server side input validation
   * Input gets escaped before being written in the database
   * Password gets hashed with sha512 before being written in the database
   * Username can only be taken once
- Creating a session in the cookie of the client if the login credentials do match
- Querying all chat rooms and sending them to the client if he is logged in
- Creating a chat room in the database
   * Server side input validation
   * Input gets escaped before being written in the database
   * Password gets hashed with sha512 before being written in the database
- Storing the user in the pendingConnections array if he successfully entered the password to a specific room
- Sending all users which are actively in a chat room to the user if he is in that room
- Putting the user in the chatroom.participants array and removing his pending connection after he establishes the websocket connection
- Distributing a message sent to a room to all the participants in that room if the sender of that message is authenticated and in that room
- Creating a pending connection after the user closes his websocket connection so that he doesn't have to reenter his password if he wishes to reconnect

## Realisation progress
Since the whole realisation of the project occured on github I encourage you to look at the commit history. Here however, are some milestones (sorry for the cryptic desriptions I had to cobble them together from my commit messages):

### 15. May - 22. May
- Initial commit
- The login page
- Some kind of style specification for the whole project since it should look coherent in the end
- Listening on a port with the node server
- The "create user" page

### 23. May - 30. May
- The mysql db
- Connecting the node server to the mysql db
- Switch to webstorm ide since coding js in a plain text editor is the fucking worst
- User Authentication
- Creating user

### 31. May - 07. June
- Some nonsense

### 08. June - 15. June
- Clientside validation
- Displaying all chat rooms
- Server side input validation
- Querying chat rooms / sending them to client
- Popup for creating a new chat room
- Big refactor
- Creating chat room working
- Sending a join req to server working
- Refactoring
- Work on chat rooms on server side
- Querying users in chat room works

### 16. June - 23. June
- Delete of a table on db since it's useless
- Work on sending messages
- Sending messages works
- Working on frontend for chat page
- Refactoring
- Better system for storing connections

### 24.June - 01 July
- Progress in frontend
- Message formation works
- Displaying participants with user images works

## Contributors
Sole contributor of the project is Fabian Bächli <br>
fabian.baechli@edu.tbz.ch

## License
Copyright 2017 Fabian Bächli

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
