// Updated script.js with lazy loading, mini player with progress bar, and integrated features
const searchInput = document.getElementById('searchInput');
const blogContainer = document.querySelector('.Songs-Container');
const allSongs = Array.from(document.querySelectorAll('.Songs'));

let songsPerPage = 15;
let currentIndex = 0;
let searchMode = false;
let searchResults = [];

function hideAllSongs() {
    allSongs.forEach(song => {
        song.style.display = 'none';
    });
}

function loadMoreSongs(songList) {
    const nextSongs = songList.slice(currentIndex, currentIndex + songsPerPage);
    nextSongs.forEach(song => {
        song.style.display = 'flex';
    });
    currentIndex += songsPerPage;
}

function resetAndLoadSongs(list) {
    hideAllSongs();
    currentIndex = 0;
    loadMoreSongs(list);
}

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        if (searchMode) {
            loadMoreSongs(searchResults);
        } else {
            loadMoreSongs(allSongs);
        }
    }
}

function getSearchResults(term) {
    const searchWords = term.toLowerCase().split(' ').filter(word => word.trim() !== '');
    return allSongs.filter(song => {
        const keywords = song.dataset.keywords.toLowerCase();
        const title = song.querySelector('p')?.textContent.toLowerCase() || '';
        return searchWords.every(word => keywords.includes(word) || title.includes(word));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    resetAndLoadSongs(allSongs);
    window.addEventListener('scroll', handleScroll);
});

searchInput.addEventListener('input', function (e) {
    const term = e.target.value;
    if (term.trim() === '') {
        searchMode = false;
        resetAndLoadSongs(allSongs);
    } else {
        searchMode = true;
        searchResults = getSearchResults(term);
        resetAndLoadSongs(searchResults);
    }
});

// Mini player & progress bar
const bottomPlayerDiv = document.getElementById('bottom-music-player');
const playerTimeline = document.getElementById('player-timeline');
const seekbar = document.getElementById('seekbar');

let currentSongIndex = 0;
let visibleSongs = getVisibleSongs();

function getVisibleSongs() {
    return Array.from(document.querySelectorAll('.Songs'))
        .filter(songTile => songTile.style.display !== 'none')
        .map(tile => tile.querySelector('audio'));
}

function updatePlayer(songElement) {
    const parent = songElement.closest('.Songs');
    document.getElementById('player-song-img').src = parent.querySelector('img').src;
    document.getElementById('player-song-title').innerText = parent.querySelector('.songdetail').innerText;
    document.getElementById('play-pause').innerText = '⏸️';
    document.getElementById('player-timeline').style.display = 'block';
    seekbar.max = songElement.duration;
    seekbar.value = songElement.currentTime;
}

document.querySelectorAll('.Songs audio').forEach((audio) => {
    audio.addEventListener('play', () => {
        visibleSongs = getVisibleSongs();
        currentSongIndex = visibleSongs.indexOf(audio);
        updatePlayer(audio);
    });
});

document.getElementById('play-pause').addEventListener('click', () => {
    const currentSong = visibleSongs[currentSongIndex];
    if (currentSong.paused) {
        currentSong.play();
        document.getElementById('play-pause').innerText = '⏸️';
    } else {
        currentSong.pause();
        document.getElementById('play-pause').innerText = '▶️';
    }
});

document.getElementById('next-song').addEventListener('click', () => {
    if (currentSongIndex < visibleSongs.length - 1) {
        visibleSongs[currentSongIndex].pause();
        currentSongIndex++;
        visibleSongs[currentSongIndex].play();
        updatePlayer(visibleSongs[currentSongIndex]);
    }
});

document.getElementById('prev-song').addEventListener('click', () => {
    if (currentSongIndex > 0) {
        visibleSongs[currentSongIndex].pause();
        currentSongIndex--;
        visibleSongs[currentSongIndex].play();
        updatePlayer(visibleSongs[currentSongIndex]);
    }
});

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
    const currentAudio = visibleSongs[currentSongIndex];
    if (currentAudio && !currentAudio.paused) {
        seekbar.max = currentAudio.duration;
        seekbar.value = currentAudio.currentTime;
    }
}, 300);

seekbar.addEventListener('input', () => {
    const currentAudio = visibleSongs[currentSongIndex];
    if (currentAudio) {
        currentAudio.currentTime = seekbar.value;
    }
});


// === 2. Shuffle Button in Title Bar ===
const titleBar = document.querySelector('header p');
const buttonBar = document.createElement('div');
buttonBar.style.display = 'flex';
buttonBar.style.alignItems = 'center';
buttonBar.style.marginLeft = 'auto';

const shuffleBtn = document.createElement('button');
shuffleBtn.textContent = '🔀 Shuffle';
shuffleBtn.style.fontSize = '16px';

buttonBar.appendChild(shuffleBtn);
titleBar.parentElement.style.display = 'flex';
titleBar.parentElement.style.alignItems = 'center';
titleBar.parentElement.appendChild(buttonBar);

// === 4. Shuffle Visible Songs ===
shuffleBtn.addEventListener('click', () => {
    const container = document.querySelector('.Songs-Container');
    const visibleSongs = Array.from(container.querySelectorAll('.Songs')).filter(s => s.style.display !== 'none');

    const shuffled = visibleSongs.sort(() => Math.random() - 0.5);
    shuffled.forEach(song => container.appendChild(song));
});
