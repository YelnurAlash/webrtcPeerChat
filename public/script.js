const socket = io('/');
const audioGrid = document.getElementById('audio-grid');
const myPeer = new Peer(undefined, {
  host: '/',
  port: '7001'
});

const myAudio = document.createElement('audio'); // Change this to create an audio element
myAudio.muted = true;
const peers = {};

navigator.mediaDevices.getUserMedia({
  video: false, // Set video to false to get an audio-only stream
  audio: true
}).then(stream => {
  addAudioStream(myAudio, stream);

  myPeer.on('call', call => {
    call.answer(stream);
    const audio = document.createElement('audio'); // Change this to create an audio element
    call.on('stream', userAudioStream => {
      addAudioStream(audio, userAudioStream);
    });
  });

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream);
  });
});

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const audio = document.createElement('audio'); // Change this to create an audio element
  call.on('stream', userAudioStream => {
    addAudioStream(audio, userAudioStream);
  });
  call.on('close', () => {
    audio.remove();
  });

  peers[userId] = call;
}

function addAudioStream(audio, stream) {
  audio.srcObject = stream;
  audio.addEventListener('loadedmetadata', () => {
    audio.play();
  });
  audioGrid.append(audio);
}
