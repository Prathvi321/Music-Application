const searchInput = document.getElementById('searchInput');
const blogContainer = document.querySelector('.Songs-Container');
const audioElements = document.querySelectorAll('audio');
let currentAudio = null;

searchInput.addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const searchWords = searchTerm.split(' ').filter(word => word.trim() !== '');

    const blogPosts = blogContainer.querySelectorAll('.Songs');

    blogPosts.forEach(post => {
        const keywords = post.dataset.keywords.toLowerCase();
        const title = post.querySelector('h2') ? post.querySelector('h2').textContent.toLowerCase() : '';
        const content = post.querySelector('p') ? post.querySelector('p').textContent.toLowerCase() : '';

        let postMatches = false;

        if (searchWords.length === 0) {
            post.style.display = 'flex';
            return;
        }

        searchWords.forEach(word => {
            if (title.includes(word) || content.includes(word) || keywords.includes(word)) {
                postMatches = true;
            }
        });

        post.style.display = postMatches ? 'flex' : 'none';
    });
});

audioElements.forEach(audio => {
    audio.addEventListener('play', () => {
        currentAudio = audio;
        audioElements.forEach(otherAudio => {
            if (otherAudio !== audio) {
                otherAudio.pause();
            }
        });
        updatePlayer(audio);
    });

    audio.addEventListener('ended', () => {
        const visibleAudios = Array.from(audioElements).filter(a => a.closest('.Songs').style.display !== 'none');
        const currentIndex = visibleAudios.indexOf(audio);
        const nextAudio = visibleAudios[currentIndex + 1] || visibleAudios[0];
        if (nextAudio) {
            nextAudio.play();
        }
    });

    audio.addEventListener('pause', () => {
        const parentTile = audio.closest('.Songs');
        if (parentTile) {
            parentTile.style.transform = 'scale(1)';
            parentTile.style.color = '';
        }
    });

    audio.addEventListener('ended', () => {
        const parentTile = audio.closest('.Songs');
        if (parentTile) {
            parentTile.style.transform = 'scale(1)';
            parentTile.style.color = '';
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
        tile.style.display = 'none';
    } else {
        if (audioSrc) uniqueSources.add(audioSrc);
        if (imgSrc) uniqueSources.add(imgSrc);
    }
});

function updatePlayer(audio) {
    const parent = audio.closest('.Songs');
    document.getElementById('player-song-img').src = parent.querySelector('img').src;
    document.getElementById('player-song-title').innerText = parent.querySelector('.songdetail').innerText;
    document.getElementById('play-pause').innerText = '⏸️';
}

document.getElementById('play-pause').addEventListener('click', () => {
    if (currentAudio) {
        if (currentAudio.paused) {
            currentAudio.play();
            document.getElementById('play-pause').innerText = '⏸️';
        } else {
            currentAudio.pause();
            document.getElementById('play-pause').innerText = '▶️';
        }
    }
});

document.getElementById('next-song').addEventListener('click', () => {
    if (currentAudio) {
        const visibleAudios = Array.from(audioElements).filter(a => a.closest('.Songs').style.display !== 'none');
        const currentIndex = visibleAudios.indexOf(currentAudio);
        if (currentIndex < visibleAudios.length - 1) {
            const nextAudio = visibleAudios[currentIndex + 1];
            currentAudio.pause();
            nextAudio.play();
        }
    }
});

document.getElementById('prev-song').addEventListener('click', () => {
    if (currentAudio) {
        const visibleAudios = Array.from(audioElements).filter(a => a.closest('.Songs').style.display !== 'none');
        const currentIndex = visibleAudios.indexOf(currentAudio);
        if (currentIndex > 0) {
            const prevAudio = visibleAudios[currentIndex - 1];
            currentAudio.pause();
            prevAudio.play();
        }
    }
});

const bottomPlayerDiv = document.getElementById('bottom-music-player');
const playerTimeline = document.getElementById('player-timeline');
const seekbar = document.getElementById('seekbar');

bottomPlayerDiv.addEventListener('click', (e) => {
    e.stopPropagation();
    bottomPlayerDiv.classList.add('expanded');
});

document.addEventListener('click', (e) => {
    if (!bottomPlayerDiv.contains(e.target)) {
        bottomPlayerDiv.classList.remove('expanded');
    }
});

setInterval(() => {
    if (currentAudio && !currentAudio.paused) {
        seekbar.max = currentAudio.duration;
        seekbar.value = currentAudio.currentTime;
    }
}, 300);

seekbar.addEventListener('input', () => {
    if (currentAudio) {
        currentAudio.currentTime = seekbar.value;
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('ServiceWorker registered with scope:', registration.scope);
        }).catch(error => {
            console.error('ServiceWorker registration failed:', error);
        });
    });
}

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
installButton.style.display = 'none';
document.body.appendChild(installButton);

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = 'block';
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

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installButton.style.display = 'none';
});