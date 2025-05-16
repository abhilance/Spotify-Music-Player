// Main script.js file with Jamendo API integration
console.log("Music Player with Jamendo API");

// API Configuration for Jamendo
const JAMENDO_CLIENT_ID = "2c9a11b9"; // This is a generic client ID - you should get your own from Jamendo
const JAMENDO_API_BASE = "https://api.jamendo.com/v3.0";

// Player state
let currentsong = new Audio();
let currentAlbumSongs = [];
let albums = [];

// Format seconds to minutes:seconds display
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Fetch featured albums from Jamendo API
async function fetchAlbums() {
    try {
        const response = await fetch(`${JAMENDO_API_BASE}/albums/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=10&boost=popularity_total`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch albums');
        }
        
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Error fetching albums:", error);
        // Return some demo albums as fallback in case API fails
        return getDemoAlbums();
    }
}

// Get songs for a specific album
async function fetchAlbumSongs(albumId) {
    try {
        const response = await fetch(`${JAMENDO_API_BASE}/albums/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&id=${albumId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch album tracks');
        }
        
        const data = await response.json();
        return data.results && data.results[0] ? data.results[0].tracks : [];
    } catch (error) {
        console.error("Error fetching album tracks:", error);
        return getDemoSongs(albumId);
    }
}

// Play a song
const playMusic = (song, pause = false) => {
    currentsong.src = song.audio;
    
    if (!pause) {
        currentsong.play()
            .catch(error => {
                console.error("Error playing song:", error);
                alert("Unable to play this song. Please try another one.");
            });
        play.src = "pause.svg";
    }
    
    document.querySelector(".songinfo").innerHTML = `${song.name} - ${song.artist_name}`;
    document.querySelector(".songtime").innerHTML = "00:00";
}

// Populate albums in the main content area
function displayAlbums(albums) {
    const cardContainer = document.querySelector(".cardcontainer");
    cardContainer.innerHTML = ''; // Clear existing albums
    
    albums.forEach(album => {
        const albumCard = document.createElement('div');
        albumCard.className = 'card';
        albumCard.setAttribute('data-album-id', album.id);
        
        albumCard.innerHTML = `
            <div class="playbtn">
                <svg width="100%" height="100%" viewbox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="50" fill="#1fdf64" />
                    <polygon points="35,25 75,50 35,75" fill="black" />
                </svg>
            </div>
            <div class="img">
                <img src="${album.image}" alt="${album.name}">
            </div>
            <h2>${album.name}</h2>
            <p>${album.artist_name}</p>
        `;
        
        cardContainer.appendChild(albumCard);
        
        // Add click event to load album songs
        albumCard.addEventListener('click', () => loadAlbumSongs(album.id));
    });
}

// Load songs for a specific album
async function loadAlbumSongs(albumId) {
    const songs = await fetchAlbumSongs(albumId);
    currentAlbumSongs = songs;
    
    // Find the album to display its info
    const album = albums.find(album => album.id === albumId);
    
    // Update the songlist
    displaySongsInLibrary(songs, album);
}

// Display songs in the library section
function displaySongsInLibrary(songs, album) {
    const songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = ''; // Clear existing songs
    
    // Add album header if we have album info
    if (album) {
        // Add album header to library
        const albumHeader = document.createElement('div');
        albumHeader.className = 'album-header';
        albumHeader.innerHTML = `
            <div class="album-info">
                <h3>${album.name}</h3>
                <p>By ${album.artist_name}</p>
            </div>
        `;
        
        // Insert before the songlist
        const libraryDiv = document.querySelector(".library");
        const songlistDiv = document.querySelector(".songlist");
        
        // Remove old header if exists
        const oldHeader = document.querySelector(".album-header");
        if (oldHeader) {
            oldHeader.remove();
        }
        
        libraryDiv.insertBefore(albumHeader, songlistDiv);
    }
    
    // Add songs to the list
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.setAttribute('data-index', index);
        
        li.innerHTML = `
            <img src="music.svg" alt="">
            <div class="info">
                <div>${song.name}</div>
                <div>${song.artist_name}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
            </div>
            <img src="SVG/play.svg" alt="">
        `;
        
        songul.appendChild(li);
        
        // Add click event to play the song
        li.addEventListener('click', () => {
            playMusic(song);
            updateActiveSong(index);
        });
    });
    
    // Play the first song if available
    if (songs.length > 0) {
        playMusic(songs[0], true); // true means don't autoplay
        updateActiveSong(0);
    }
}

// Update the active song in the UI
function updateActiveSong(index) {
    // Remove active class from all songs
    const allSongs = document.querySelectorAll('.songlist li');
    allSongs.forEach(song => song.classList.remove('active'));
    
    // Add active class to current song
    const currentSong = document.querySelector(`.songlist li[data-index="${index}"]`);
    if (currentSong) {
        currentSong.classList.add('active');
    }
}

// Get current song index
function getCurrentSongIndex() {
    const currentSrc = currentsong.src;
    return currentAlbumSongs.findIndex(song => song.audio === currentSrc);
}

// Fallback demo albums in case API fails
function getDemoAlbums() {
    return [
        {
            id: "demo1",
            name: "Chillout Mix",
            artist_name: "Various Artists",
            image: "https://charts-images.scdn.co/assets/locale_en/regional/weekly/region_global_default.jpg"
        },
        {
            id: "demo2",
            name: "Rock Classics",
            artist_name: "Rock Legends",
            image: "https://charts-images.scdn.co/assets/locale_en/regional/weekly/region_global_default.jpg"
        },
        {
            id: "demo3",
            name: "Jazz Collection",
            artist_name: "Jazz Masters",
            image: "https://charts-images.scdn.co/assets/locale_en/regional/weekly/region_global_default.jpg"
        },
        {
            id: "demo4",
            name: "Electronic Beats",
            artist_name: "DJ Mix",
            image: "https://charts-images.scdn.co/assets/locale_en/regional/weekly/region_global_default.jpg"
        }
    ];
}

// Fallback demo songs in case API fails
function getDemoSongs(albumId) {
    const demoSongs = {
        "demo1": [
            { id: "s1", name: "Relaxing Waves", artist_name: "Ocean Sounds", audio: "https://mp3.chillhop.com/serve.php/?mp3=10075" },
            { id: "s2", name: "Gentle Rain", artist_name: "Nature Vibes", audio: "https://mp3.chillhop.com/serve.php/?mp3=9272" },
            { id: "s3", name: "Midnight Lounge", artist_name: "Smooth Jazz", audio: "https://mp3.chillhop.com/serve.php/?mp3=9222" }
        ],
        "demo2": [
            { id: "s4", name: "Highway Star", artist_name: "Rock Legends", audio: "https://mp3.chillhop.com/serve.php/?mp3=9148" },
            { id: "s5", name: "Stone Cold", artist_name: "Classic Rock", audio: "https://mp3.chillhop.com/serve.php/?mp3=8200" },
            { id: "s6", name: "Breaking Free", artist_name: "Rock Anthem", audio: "https://mp3.chillhop.com/serve.php/?mp3=9900" }
        ],
        "demo3": [
            { id: "s7", name: "Blue Note", artist_name: "Jazz Masters", audio: "https://mp3.chillhop.com/serve.php/?mp3=10075" },
            { id: "s8", name: "Saxophone Serenade", artist_name: "Jazz Ensemble", audio: "https://mp3.chillhop.com/serve.php/?mp3=9248" },
            { id: "s9", name: "Midnight in Paris", artist_name: "Smooth Jazz", audio: "https://mp3.chillhop.com/serve.php/?mp3=9154" }
        ],
        "demo4": [
            { id: "s10", name: "Electric Dreams", artist_name: "DJ Mix", audio: "https://mp3.chillhop.com/serve.php/?mp3=10075" },
            { id: "s11", name: "Bass Drop", artist_name: "EDM Masters", audio: "https://mp3.chillhop.com/serve.php/?mp3=9279" },
            { id: "s12", name: "Neon Lights", artist_name: "Synth Wave", audio: "https://mp3.chillhop.com/serve.php/?mp3=9333" }
        ]
    };
    
    return demoSongs[albumId] || [];
}

// Main initialization function
async function main() {
    try {
        // Fetch and display albums
        albums = await fetchAlbums();
        displayAlbums(albums);
        
        // Default to the first album's songs
        if (albums.length > 0) {
            await loadAlbumSongs(albums[0].id);
        }
        
        // Listen for time updates on the current song
        currentsong.addEventListener("timeupdate", () => {
            document.querySelector(".songtime").innerHTML = 
                `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`;
            
            // Update seek bar position
            const percent = (currentsong.currentTime / currentsong.duration) * 100;
            document.querySelector(".circle").style.left = percent + "%";
        });
        
        // Add event listener for song end to play next song
        currentsong.addEventListener("ended", () => {
            const nextIndex = getCurrentSongIndex() + 1;
            if (nextIndex < currentAlbumSongs.length) {
                playMusic(currentAlbumSongs[nextIndex]);
                updateActiveSong(nextIndex);
            } else {
                // Reset to first song if we've reached the end
                playMusic(currentAlbumSongs[0]);
                updateActiveSong(0);
            }
        });
        
        // Play/Pause button functionality
        document.getElementById("play").addEventListener("click", () => {
            if (currentsong.paused) {
                currentsong.play().catch(e => console.error("Play error:", e));
                play.src = "SVG/pause.svg";
            } else {
                currentsong.pause();
                play.src = "SVG/play.svg";
            }
        });
        
        // Seekbar click event
        document.querySelector(".seekbar").addEventListener("click", (e) => {
            const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentsong.currentTime = ((currentsong.duration) * percent) / 100;
        });
        
        // Previous song button
        document.getElementById("prev").addEventListener("click", () => {
            const currentIndex = getCurrentSongIndex();
            if (currentIndex > 0) {
                playMusic(currentAlbumSongs[currentIndex - 1]);
                updateActiveSong(currentIndex - 1);
            }
        });
        
        // Next song button
        document.getElementById("next").addEventListener("click", () => {
            const currentIndex = getCurrentSongIndex();
            if (currentIndex < currentAlbumSongs.length - 1) {
                playMusic(currentAlbumSongs[currentIndex + 1]);
                updateActiveSong(currentIndex + 1);
            }
        });
        
        // Volume control
        document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
            currentsong.volume = parseInt(e.target.value) / 100;
        });
        
        // Mobile menu controls
        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = "0";
        });
        
        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-120%";
        });
        
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

// Initialize the app
window.addEventListener('DOMContentLoaded', main);
