let socket = null;

(function () {
	function handleLogin() {
		// 拿到登录信息
		var userName = document.querySelector('.usrName input').value;
		document.cookie = 'userName=' + userName;
		var userPassword = document.querySelector('.usrPwd input').value;
		socket = io({
			query: {
				name: userName,
				password: userPassword,
			},
			reconnection: false,
		});
		socket.on('connect_error', err => {
			if (
				(err && err.message === 'INVALID_USERNAME') ||
				err.message === 'INVALID_PASSWORD'
			) {
				alert('认证失败');
				return;
			}
			alert('连接失败，请检查WebSocket服务器');
		});
		//登录成功
		socket.on('connect', () => {
			alert('登录成功！');
			showChatRoom();
			fetch('/history')
				.then(res => res.json())
				.then(history => {
					console.log('history:', history);
					updateMessageList(history);
				});
		});

		socket.on('disconnect', () => {
			alert('用户' + userName + '离开聊天室');
		});

		socket.on('online', users => {
			console.log('online users:', users);
			updateUserList(users);
		});

		socket.on('receiveMessage', message => {
			console.log('receive a broadcast message:', message);
		});
	}
	function showChatRoom() {
		// 隐藏登录框，展示聊天框
		var login = document.querySelector('.login');
		var chatRoom = document.querySelector('.chatroom');
		login.style.top = '-100%';
		chatRoom.style.top = '0';
	}
	var loginButton = document.querySelector('.login-button');
	loginButton.addEventListener(
		'click',
		function (e) {
			handleLogin();
		},
		false
	);

	function sendMsg(msg) {
		//发送消息

		if (msg.length > 0) {
			send(msg);
			var msgBox = document.createElement('div');
			msgBox.setAttribute('class', 'list-item');

			var avatar = document.createElement('img');
			avatar.src = './logo.png';
			avatar.setAttribute('class', 'avatar');

			// username
			var usernameTxt = document.createElement('div');
			usernameTxt.setAttribute('class', 'username');
			usernameTxt.innerHTML = getCookie('userName');

			var msgTxt = document.createElement('div');
			msgTxt.setAttribute('class', 'message');
			msgTxt.innerHTML = msg;

			var userBox = document.createElement('div');
			userBox.setAttribute('class', 'userBox');
			userBox.appendChild(usernameTxt);
			userBox.appendChild(msgTxt);

			msgBox.appendChild(userBox);
			msgBox.appendChild(avatar);
			var msgList = document.querySelector('.list');
			msgList.appendChild(msgBox);
			clearBox();
		}
	}

	// 发送一条消息
	function send(msg) {
		socket.emit('sendMessage', msg);
	}

	function clearBox() {
		//发送后清除聊天框消息
		var input = document.querySelector('.input-wrap .input');
		input.value = '';
	}

	var sendButton = document.querySelector('.input-wrap button');
	sendButton.addEventListener(
		'click',
		function () {
			var message = document.querySelector('.input-wrap .input').value;
			sendMsg(message);
		},
		false
	);

	// 渲染在线用户列表
	function updateUserList(users) {
		const userList = document.querySelector('.contact-list');
		userList.innerHTML = '';

		users.forEach(user => {
			const li = document.createElement('li');
			li.innerText = user;

			userList.appendChild(li);
		});
	}

	// 更新消息框中的所有消息
	function updateMessageList(history) {
		history.forEach(item => {
			var msgBox = document.createElement('div');
			msgBox.setAttribute('class', 'list-item list-item-right');

			var avatar = document.createElement('img');
			avatar.src = './logo.png';
			avatar.setAttribute('class', 'avatar');

			var msgTxt = document.createElement('div');
			msgTxt.setAttribute('class', 'message');
			msgTxt.innerHTML = item;

			msgBox.appendChild(avatar);
			msgBox.appendChild(msgTxt);
			var msgList = document.querySelector('.list');
			msgList.appendChild(msgBox);
		});
	}
})();

// 获取指定名称的cookie
function getCookie(name) {
	var strcookie = document.cookie; //获取cookie字符串
	var arrcookie = strcookie.split('; '); //分割
	//遍历匹配
	for (var i = 0; i < arrcookie.length; i++) {
		var arr = arrcookie[i].split('=');
		if (arr[0] == name) {
			return arr[1];
		}
	}
	return '';
}
