const API_KEY = "Enter Your Api Here";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const COUNTRY = "IN";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const aiBtn = document.getElementById("aiBtn");
const trendingBtn = document.getElementById("trendingBtn");
const resultsContainer = document.getElementById("movieResults");
const genrePicker = document.getElementById("genrePicker");
const modal = document.getElementById("movieModal");
const closeBtn = document.querySelector(".close-btn");

document.getElementById("homeLink").addEventListener("click", e => {
  e.preventDefault();
  resetHome();
});
document.getElementById("searchLink").addEventListener("click", e => {
  e.preventDefault();
  searchInput.focus();
  searchInput.scrollIntoView({ behavior: "smooth" });
});
trendingBtn.addEventListener("click", () => {
  fetchMovies(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
});
searchInput.addEventListener("input", () => {
  searchBtn.classList.toggle("hidden", searchInput.value.trim() === "");
});
searchBtn.addEventListener("click", () => {
  const q = searchInput.value.trim();
  if (q) fetchMovies(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}`);
});
aiBtn.addEventListener("click", () => genrePicker.classList.toggle("hidden"));
document.querySelectorAll(".genre-list button").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-genre");
    fetchMovies(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${id}`);
    genrePicker.classList.add("hidden");
  });
});
closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

function resetHome() {
  document.querySelector(".rainbow-text").innerHTML = `🎬 <span class="rainbow-glow">GET LATEST MOVIE INFO INSTANTLY</span>`;
  document.getElementById("heroDesc").innerHTML = `
    <em>📽️ Explore trending, top‑rated, and upcoming movies — all in one stylish place! 🍿</em><br />
    <em>🎞️ Discover latest releases, cult classics, and hidden gems! 💎</em><br />
    <em>📡 Real‑time movie data coming soon — stay tuned! 🛸</em>`;
  searchInput.value = "";
  searchBtn.classList.add("hidden");
  resultsContainer.innerHTML = "";
  modal.classList.add("hidden");
  genrePicker.classList.add("hidden");
  document.getElementById("heroSection").scrollIntoView({ behavior: "smooth" });
}

function fetchMovies(url) {
  resultsContainer.innerHTML = "<p style='color:#0ff; text-align:center;'>Loading…</p>";
  fetch(url)
    .then(res => res.json())
    .then(data => displayMovies(data.results.slice(0, 8)))
    .catch(() => resultsContainer.innerHTML = "<p style='color:red;'>Error loading data.</p>");
}

function displayMovies(movies) {
  resultsContainer.innerHTML = "";
  if (!movies.length) {
    resultsContainer.innerHTML = "<p style='color:orange;'>😕 No movies found.</p>";
    return;
  }
  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <img src="${movie.poster_path ? IMG_URL + movie.poster_path : 'https://via.placeholder.com/300x450'}" alt="${movie.title}">
      <h4>${movie.title}</h4>
      <p>⭐ ${movie.vote_average || "N/A"} | 📅 ${movie.release_date || "Unknown"}</p>
      <div class="streaming-providers" id="prov-${movie.id}">Loading…</div>
    `;
    card.addEventListener("click", () => showDetails(movie));
    resultsContainer.appendChild(card);
    fetchProviders(movie.id);
  });
}

function fetchProviders(id) {
  const el = document.getElementById(`prov-${id}`);
  fetch(`${BASE_URL}/movie/${id}/watch/providers?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const list = data.results?.[COUNTRY]?.flatrate || [];
      if (!list.length) return el.innerHTML = "<p style='color:#ccc;'>Not available in region.</p>";
      el.innerHTML = "";
      list.forEach(p => {
        const img = document.createElement("img");
        img.src = `https://image.tmdb.org/t/p/original${p.logo_path}`;
        img.alt = p.provider_name;
        el.appendChild(img);
      });
    })
    .catch(() => el.innerHTML = "<p style='color:red;'>Err</p>");
}

function showDetails(movie) {
  modal.querySelector("#modalPoster").src = movie.poster_path ? IMG_URL + movie.poster_path : 'https://via.placeholder.com/300x450';
  modal.querySelector("#modalTitle").textContent = movie.title;
  modal.querySelector("#modalRatingDate").textContent = `⭐ ${movie.vote_average || "N/A"} | 📅 ${movie.release_date || "Unknown"}`;
  modal.querySelector("#modalOverview").textContent = movie.overview || "No description available.";
  modal.classList.remove("hidden");
}
