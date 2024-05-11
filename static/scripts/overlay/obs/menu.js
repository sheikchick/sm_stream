var sound = document.createElement('audio')
sound.id = 'media'
sound.controls = 'controls'
sound.loop = 'loop';
sound.src = '/static/scripts/overlay/obs/menu.wav'
sound.type = 'audio/mp3'
document.body.appendChild(sound)

function playAudio() {
  document.getElementById('media').play();
}

setTimeout("playAudio()", 3000);