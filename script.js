const searchInput = document.getElementById('searchInput');
const blogContainer = document.querySelector('.Songs-Container');

searchInput.addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const searchWords = searchTerm.split(' ').filter(word => word.trim() !== ''); // Split into words, remove empty words

    const blogPosts = blogContainer.querySelectorAll('.Songs');

    blogPosts.forEach(post => {
        const keywords = post.dataset.keywords.toLowerCase();
        const title = post.querySelector('h2') ? post.querySelector('h2').textContent.toLowerCase() : '';
        const content = post.querySelector('p') ? post.querySelector('p').textContent.toLowerCase() : '';

        let postMatches = false; // Flag to check if the post matches any search word

        if (searchWords.length === 0) { // If no search words, show all posts
            post.style.display = 'flex';
            return;
        }

        searchWords.forEach(word => {
            if (title.includes(word) || content.includes(word) || keywords.includes(word)) {
                postMatches = true; // If any word matches, set the flag to true
            }
        });

        if (postMatches) {
            post.style.display = 'flex';
        } else {
            post.style.display = 'none';
        }
    });
});
const audioElements = document.querySelectorAll('audio');

audioElements.forEach((audio, index) => {
    audio.addEventListener('ended', () => {
        const visibleAudios = Array.from(audioElements).filter(a => a.closest('.Songs').style.display !== 'none');
        const currentAudioIndex = visibleAudios.indexOf(audio);
        const nextAudio = visibleAudios[currentAudioIndex + 1];
        if (nextAudio) {
            nextAudio.play();
        }
    });
});
audioElements.forEach(audio => {
    audio.addEventListener('play', () => {
        audioElements.forEach(otherAudio => {
            if (otherAudio !== audio) {
                otherAudio.pause();
            }
        });
    });
});

audioElements.forEach(audio => {
    audio.addEventListener('ended', () => {
        const visibleAudios = Array.from(audioElements).filter(a => a.closest('.Songs').style.display !== 'none');
        const currentAudioIndex = visibleAudios.indexOf(audio);
        const nextAudio = visibleAudios[currentAudioIndex + 1];
        if (nextAudio) {
            nextAudio.play();
        } else if (visibleAudios.length > 0) {
            visibleAudios[0].play(); // Loop back to the first visible audio
        }
    });
});

const uniqueSources = new Set();

const songTiles = document.querySelectorAll('.Songs');
songTiles.forEach(tile => {
    const audio = tile.querySelector('audio');
    const img = tile.querySelector('img');

    const audioSrc = audio ? audio.src : null;
    const imgSrc = img ? img.src : null;

    if ((audioSrc && uniqueSources.has(audioSrc)) || (imgSrc && uniqueSources.has(imgSrc))) {
        tile.style.display = 'none'; // Hide duplicate tiles
    } else {
        if (audioSrc) uniqueSources.add(audioSrc);
        if (imgSrc) uniqueSources.add(imgSrc);
    }
});

audioElements.forEach(audio => {
    audio.addEventListener('play', () => {
        const parentTile = audio.closest('.Songs');
        if (parentTile) {
            parentTile.style.transform = 'scale(1.05)';
            parentTile.style.transition = 'transform 0.3s ease';
            parentTile.style.color = 'blue'; // Change text color or any other detail color
        }
    });

    audio.addEventListener('pause', () => {
        const parentTile = audio.closest('.Songs');
        if (parentTile) {
            parentTile.style.transform = 'scale(1)';
            parentTile.style.color = ''; // Reset to default color
        }
    });

    audio.addEventListener('ended', () => {
        const parentTile = audio.closest('.Songs');
        if (parentTile) {
            parentTile.style.transform = 'scale(1)';
            parentTile.style.color = ''; // Reset to default color
        }
    });
});

// Register a service worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('ServiceWorker registered with scope:', registration.scope);
        }).catch(error => {
            console.error('ServiceWorker registration failed:', error);
        });
    });
}

// Add an install prompt for the PWA
let deferredPrompt;
const installButton = document.createElement('button');
installButton.textContent = 'Install App';
installButton.style.position = 'fixed';
installButton.style.bottom = '20px';
installButton.style.right = '20px';
installButton.style.padding = '10px 20px';
installButton.style.backgroundColor = '#007BFF';
installButton.style.color = '#FFF';
installButton.style.border = 'none';
installButton.style.borderRadius = '5px';
installButton.style.cursor = 'pointer';
installButton.style.display = 'none'; // Initially hidden
document.body.appendChild(installButton);

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = 'block'; // Show the install button
});

installButton.addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choiceResult => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    }
});

// Hide the install button after the app is installed
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installButton.style.display = 'none';
});

const songs = document.querySelectorAll('.Songs audio');
let currentSongIndex = 0;

function updatePlayer(songElement) {
    const parent = songElement.closest('.Songs');
    document.getElementById('player-song-img').src = parent.querySelector('img').src;
    document.getElementById('player-song-title').innerText = parent.querySelector('.songdetail').innerText;
    document.getElementById('play-pause').innerText = '⏸️';
}

songs.forEach((audio, index) => {
    audio.addEventListener('play', () => {
        currentSongIndex = index;
        updatePlayer(audio);
    });
});

document.getElementById('play-pause').addEventListener('click', () => {
    const currentSong = songs[currentSongIndex];
    if (currentSong.paused) {
        currentSong.play();
        document.getElementById('play-pause').innerText = '⏸️';
    } else {
        currentSong.pause();
        document.getElementById('play-pause').innerText = '▶️';
    }
});

document.getElementById('next-song').addEventListener('click', () => {
    if (currentSongIndex < songs.length - 1) {
        songs[currentSongIndex].pause();
        currentSongIndex++;
        songs[currentSongIndex].play();
        updatePlayer(songs[currentSongIndex]);
    }
});

document.getElementById('prev-song').addEventListener('click', () => {
    if (currentSongIndex > 0) {
        songs[currentSongIndex].pause();
        currentSongIndex--;
        songs[currentSongIndex].play();
        updatePlayer(songs[currentSongIndex]);
    }
});