import axios from "axios";
import "./style.css";

const container = document.querySelector("#pokemonContainer");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const clearSearchBtn = document.querySelector("#clearSearch");
const typeFilter = document.querySelector("#typeFilter");

const modal = document.querySelector("#pokemonModal");
modal.classList.add("hidden");
const closeModalBtn = document.querySelector("#closeModal");
const pokemonDetails = document.querySelector("#pokemonDetails");

let offset = 0;
const limit = 24;
let currentType = "";
let searchQuery = "";

// Type-farger
const typeColors = {
  grass: "#78C850",
  fire: "#F08030",
  water: "#6890F0",
  bug: "#A8B820",
  normal: "#A8A878",
  electric: "#F8D030",
  poison: "#A040A0",
  ground: "#E0C068",
  fairy: "#EE99AC",
  fighting: "#C03028",
  psychic: "#F85888",
  rock: "#B8A038",
  ghost: "#705898",
  ice: "#98D8D8",
  dragon: "#7038F8"
};

async function getPokemonList() {
  container.innerHTML = "";

  try {
    if (currentType) {
      const typeData = await axios.get(`https://pokeapi.co/api/v2/type/${currentType}`);
      const allTypePokemons = typeData.data.pokemon.map(p => p.pokemon.name);
      const pagePokemons = allTypePokemons.slice(offset, offset + limit);
      for (const name of pagePokemons) {
        const pokeData = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
        createPokemonCard(pokeData.data, false);
      }
      return;
    }

    if (searchQuery) {
      try {
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase()}`);
        createPokemonCard(res.data, true);
      } catch {
        container.innerHTML = `<p>Fant ikke Pokémon "${searchQuery}" 😢</p>`;
      }
      return;
    }

    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    for (const p of res.data.results) {
      const pokeData = await axios.get(p.url);
      createPokemonCard(pokeData.data, false);
    }
  } catch (error) {
    container.innerHTML = "<p>Feil ved lasting av Pokémon.</p>";
  }
}

function createPokemonCard(pokemon, isSearchResult) {
  const card = document.createElement("div");
  const type = pokemon.types[0].type.name;
  const bgColor = typeColors[type] || "#A8A878";
  card.className = "pokemon-card";
  card.style.backgroundColor = bgColor;

  // Mindre kort ved søk
  if (isSearchResult) {
    card.classList.add("search-result");
  }

  const formattedId = `#${pokemon.id.toString().padStart(3, "0")}`;

  card.innerHTML = `
    <h3>${formattedId}</h3>
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
  `;

  card.addEventListener("click", () => showPokemonDetails(pokemon));
  container.appendChild(card);
}

function showPokemonDetails(pokemon) {
  pokemonDetails.innerHTML = `
    <h2>${pokemon.name.toUpperCase()} (#${pokemon.id})</h2>
    <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
    <p>Type: ${pokemon.types.map(t => t.type.name).join(", ")}</p>
    <p>Høyde: ${pokemon.height / 10} m</p>
    <p>Vekt: ${pokemon.weight / 10} kg</p>
    <h4>Stats:</h4>
    <ul>
      ${pokemon.stats.map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`).join("")}
    </ul>
  `;
  modal.classList.remove("hidden");
}

closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

prevBtn.addEventListener("click", () => {
  if (offset >= limit) {
    offset -= limit;
    getPokemonList();
  }
});

nextBtn.addEventListener("click", () => {
  offset += limit;
  getPokemonList();
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  searchQuery = searchInput.value.trim();
  offset = 0;
  getPokemonList();
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  searchQuery = "";
  offset = 0;
  getPokemonList();
});

typeFilter.addEventListener("change", () => {
  currentType = typeFilter.value;
  searchQuery = "";
  offset = 0;
  getPokemonList();
});

getPokemonList();
