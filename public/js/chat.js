const mesajul = document.querySelector('.mesajana')
const input = document.querySelector('.mesaj')
const button = document.querySelector('.gonder');

const socket = io.connect('http://localhost:3000')


button.addEventListener('click', () => {
    socket.emit('chat', {
        message: input.value
    })
})



socket.on('chat', data => {
    mesajul.innerHTML += '<li>' + data.message + '</li>'
})