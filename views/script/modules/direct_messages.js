socket.on(`message-${localStorage.getItem('currentAlumet')}`, data => {
    let div = document.createElement('div');
        div.classList.add('user-message');
        div.innerHTML = `
        <img class="pp" src="../../assets/app/default.png">
        <div class="message-content">
            <div class="username">
                <p>${data.owner}</p>
            </div>
            <div class="message">
                <p>${data.message}</p>
            </div>
        </div>`
        document.getElementById('conversation').appendChild(div);
        let elem = document.getElementById('conversation');
        elem.scrollTop = elem.scrollHeight;
})


document.querySelector('.modules-container').innerHTML += `
<div id="dm" class="module-container module">
    <div class="module-header">
        <p>${localStorage.getItem('name')}</p>
    </div>
    <div id="conversation" class="conversation">
      <div class="no-items">
        <h1>Pas de messages</h1>
        <p>Qui fera le premier pas ?!</p>
      </div>
    </div>
    <div class="module-footer">
        <input id="message-input" type="text" placeholder="Envoyer un message" class="message-input">
        <span class="material-symbols-rounded send-button">send</span>
    </div>
</div>`;

setTimeout(() => {
    document.querySelector('.send-button').addEventListener('click', () => {
        sendMessage();
    })


    document.querySelector('.message-input').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            document.querySelector('.send-button').classList.add('button--loading');
            sendMessage();
        }
    })
}, 1000)

function getMessages() {
  fetch(`/api/dm/get/${localStorage.getItem('currentAlumet')}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    if (data.length !== 0 ) document.getElementById('conversation').innerHTML = '';
    data.forEach(message => {
      let div = document.createElement('div');
      div.classList.add('user-message');
      div.innerHTML = `
        <img class="pp" src="../../assets/app/default.png">
        <div class="message-content">
          <div class="username">
            <p>${message.owner}</p>
          </div>
          <div class="message">
            <p>${message.content}</p>
          </div>
        </div>`;
      document.getElementById('conversation').appendChild(div);
    });
    let elem = document.getElementById('conversation');
    elem.scrollTop = elem.scrollHeight;
  })
  .catch(error => console.error(error));
}
getMessages();

function sendMessage() {
    let message = document.getElementById('message-input').value;
    fetch(`/api/dm/send/${localStorage.getItem('currentAlumet')}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            content: message
        })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        toast({
          title: "Quelque chose s'est mal passé",
          message: `${data.error}`,
          type: "error",
          duration: 3000
        })
      } else {
        document.querySelector('.message-input').value = '';
      }
    })
}





