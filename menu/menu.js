var sound = document.createElement('audio')
sound.id = 'audio'
sound.controls = 'controls'
sound.loop = 'loop';
sound.src = 'menu.wav'
sound.type = 'audio/mp3'
document.body.appendChild(sound)

function playAudio() {
  document.getElementById('audio').play();
}

setTimeout("playAudio()", 3000);