var socket = io();

var username = 'RandomUser';
var id = '00000000';

var users = [];
var userDisplay = document.getElementById('users');

var nameDisplay = document.getElementById('name');
var idDisplay = document.getElementById('id');
var nameForm = document.getElementById('nameForm');
var nameInput = document.getElementById('nameInput');

var form = document.getElementById('form');
var input = document.getElementById('input');
var messageList = document.getElementById('messages');

nameDisplay.textContent = 'Current name: ' + username;

nameForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (nameInput.value) {
        username = nameInput.value;
        nameDisplay.textContent = 'Current name: ' + username;
        socket.emit('name change', { id: id, newName: username });
    }
});

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', { id: id, name: username, message: [input.value] });
        input.value = '';
    }
});

socket.on('connect', () => {
    id = socket.id;
    // idDisplay.textContent = 'Current ID: ' + id;
})

socket.on('chat history', (messageInfo) => {
    var userInfo = messageInfo.user;

    if (userInfo.id == id) {
        messageInfo.messages.forEach(message => {
            var el = document.createElement('html');
            el.innerHTML = message.message;

            var item = document.createElement('li');
            item.textContent = `${userInfo.name}: `;
            item.appendChild(el);

            addMessage(item);
        })
    }
})

socket.on('user joined', function (userInfo) {
    users = userInfo.userList;
    userDisplay.innerHTML = '';

    users.forEach(user => {
        var item = document.createElement('li');
        item.id = user.id;
        item.textContent = user.name;
        userDisplay.appendChild(item);
    });

    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('user left', function (userInfo) {
    var leftUserId = userInfo.leftUser.id;
    var toRemoveItem = document.getElementById(leftUserId);
    toRemoveItem.remove();
    users = userInfo.userList;
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('user namechange', function (userInfo) {
    var oldUser = users.find(user => user.id == userInfo.changedUser.id);
    var oldUserName = oldUser.name;
    var newUserName = userInfo.changedUser.name;

    var userListName = document.getElementById(userInfo.changedUser.id)
    userListName.textContent = userInfo.changedUser.name;

    if (userInfo.changedUser.id != id) {
        var message = document.createElement('li');
        message.textContent = `${oldUserName} changed name to ${newUserName}`;
        addMessage(message);
    }

    users = userInfo.userList;

    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('chat message', function (messageInfo) {
    var item = document.createElement('li');
    item.textContent = `${messageInfo.name}: `;

    for (var message of messageInfo.message) {
        var el = document.createElement('html');
        el.innerHTML = message;
        item.appendChild(el);
    }

    addMessage(item);
});

function addMessage(html) {
    messageList.appendChild(html);
    window.scrollTo(0, document.body.scrollHeight);
}