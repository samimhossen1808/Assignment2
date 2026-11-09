
const API_BASE = "https://www.thecocktaildb.com/api/json/v1/1";


const drinkContainer = document.getElementById("drinkContainer");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resultCount = document.getElementById("resultCount");

const groupList = document.getElementById("groupList");
const drinkCount = document.getElementById("drinkCount");

const detailsModal = document.getElementById("detailsModal");
const modalBody = document.getElementById("modalBody");
const closeModalButton = document.getElementById("closeModal");
const modalOverlay = document.getElementById("modalOverlay");


let selectedDrinks = [];


async function loadDefaultDrinks() {

    drinkContainer.innerHTML =
        '<p class="message">Loading drinks...</p>';

    resultCount.textContent = "Loading...";

    const letters = "abcdefghijklmnopqrstuvwxyz";

    const uniqueDrinks = new Map();

    try {

        for (const letter of letters) {

            const response = await fetch(
                `${API_BASE}/search.php?f=${letter}`
            );

            if (!response.ok) {
                continue;
            }

            const data = await response.json();

            if (data.drinks) {

                data.drinks.forEach((drink) => {

                    uniqueDrinks.set(
                        drink.idDrink,
                        drink
                    );

                });

            }

            if (uniqueDrinks.size >= 10) {
                break;
            }

        }

        const drinks = Array.from(
            uniqueDrinks.values()
        );

        if (drinks.length > 0) {

            displayDrinks(drinks.slice(0, 10));

        } else {

            showMessage("No drinks found.");

        }

    } catch (error) {

        showMessage(
            "Failed to load drinks. Check your internet connection."
        );

        console.log(error);

    }

}


async function searchDrinks() {

    const searchText = searchInput.value.trim();

    if (searchText === "") {

        alert("Please enter a drink name.");

        return;

    }

    drinkContainer.innerHTML =
        '<p class="message">Searching...</p>';

    resultCount.textContent = "Searching...";

    try {

        const response = await fetch(
            `${API_BASE}/search.php?s=${encodeURIComponent(searchText)}`
        );

        if (!response.ok) {
            throw new Error("Search request failed");
        }

        const data = await response.json();

        if (data.drinks && data.drinks.length > 0) {

            displayDrinks(data.drinks);

        } else {

            showMessage(
                "Sorry! No drinks found."
            );

        }

    } catch (error) {

        showMessage("Something went wrong.");

        console.log(error);

    }

}


function displayDrinks(drinks) {

    drinkContainer.innerHTML = "";

    resultCount.textContent =
        `${drinks.length} drinks found`;

    drinks.forEach((drink) => {

        const card = document.createElement("div");

        card.className = "drink-card";

        const image = document.createElement("img");

        image.src = drink.strDrinkThumb || "";

        image.alt = drink.strDrink;

    
        const info = document.createElement("div");

        info.className = "drink-info";

        const name = document.createElement("h3");

        name.textContent = drink.strDrink;

        const category = document.createElement("span");

        category.className = "category";

        category.textContent =
            drink.strCategory || "Unknown Category";

     
        const instruction = document.createElement("p");

        instruction.className = "instructions";

        const fullInstruction =
            drink.strInstructions || "No instructions available.";

        instruction.textContent =
            fullInstruction.substring(0, 15) +
            (fullInstruction.length > 15 ? "..." : "");

        instruction.title = fullInstruction;

        const buttons = document.createElement("div");

        buttons.className = "card-buttons";

        const addButton = document.createElement("button");

        addButton.className = "add-button";

        addButton.textContent = "Add to Group";

        const detailsButton = document.createElement("button");

        detailsButton.className = "details-button";

        detailsButton.textContent = "Details";

        addButton.addEventListener("click", function() {

            addToGroup(drink);

        });

       
        detailsButton.addEventListener("click", function() {

            showDrinkDetails(drink.idDrink);

        });

        
        buttons.appendChild(addButton);

        buttons.appendChild(detailsButton);

        info.appendChild(name);

        info.appendChild(category);

        info.appendChild(instruction);

        info.appendChild(buttons);

        card.appendChild(image);

        card.appendChild(info);

        drinkContainer.appendChild(card);

    });

}


function showMessage(message) {

    drinkContainer.innerHTML = "";

    const paragraph = document.createElement("p");

    paragraph.className = "message";

    paragraph.textContent = message;

    drinkContainer.appendChild(paragraph);

    resultCount.textContent = "0 drinks found";

}


function addToGroup(drink) {

    
    const alreadyAdded = selectedDrinks.some(
        (item) => item.idDrink === drink.idDrink
    );

    if (alreadyAdded) {

        alert("This drink is already added!");

        return;

    }

    
    if (selectedDrinks.length >= 7) {

        alert("You cannot add more than 7 drinks!");

        return;

    }

    
    selectedDrinks.push({

        idDrink: drink.idDrink,

        strDrink: drink.strDrink

    });

    updateGroupList();

}


function updateGroupList() {

    
    drinkCount.textContent = selectedDrinks.length;

    groupList.innerHTML = "";

    if (selectedDrinks.length === 0) {

        groupList.innerHTML =
            '<li class="empty-message">No drinks added yet.</li>';

        return;

    }

    selectedDrinks.forEach((drink) => {

        const listItem = document.createElement("li");

        const name = document.createElement("span");

        name.textContent = drink.strDrink;

        const removeButton = document.createElement("button");

        removeButton.className = "remove-button";

        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", function() {

            selectedDrinks = selectedDrinks.filter(
                (item) => item.idDrink !== drink.idDrink
            );

            updateGroupList();

        });

        listItem.appendChild(name);

        listItem.appendChild(removeButton);

        groupList.appendChild(listItem);

    });

}



async function showDrinkDetails(drinkId) {

    modalBody.innerHTML = "<p>Loading details...</p>";

    openModal();

    try {

        const response = await fetch(
            `${API_BASE}/lookup.php?i=${drinkId}`
        );

        if (!response.ok) {
            throw new Error("Details request failed");
        }

        const data = await response.json();

        if (!data.drinks) {

            modalBody.innerHTML =
                "<p>Drink details not found.</p>";

            return;

        }

        const drink = data.drinks[0];

        
        const ingredients = [];

        for (let i = 1; i <= 15; i++) {

            const ingredient =
                drink[`strIngredient${i}`];

            const measure =
                drink[`strMeasure${i}`];

            if (ingredient && ingredient.trim() !== "") {

                ingredients.push(
                    `${measure || ""} ${ingredient}`.trim()
                );

            }

        }

        
        modalBody.innerHTML = `

            <h2>${escapeHTML(drink.strDrink)}</h2>

            <img
                class="modal-image"
                src="${escapeHTML(drink.strDrinkThumb || "")}"
                alt="${escapeHTML(drink.strDrink)}"
            >

            <p>
                <strong>Category:</strong>
                ${escapeHTML(drink.strCategory || "Not available")}
            </p>

            <p>
                <strong>Alcoholic:</strong>
                ${escapeHTML(drink.strAlcoholic || "Not available")}
            </p>

            <p>
                <strong>Glass:</strong>
                ${escapeHTML(drink.strGlass || "Not available")}
            </p>

            <p>
                <strong>Instructions:</strong>
                ${escapeHTML(drink.strInstructions || "Not available")}
            </p>

            <p>
                <strong>Ingredients:</strong>
                ${escapeHTML(ingredients.join(", ") || "Not available")}
            </p>

            <p>
                <strong>Drink ID:</strong>
                ${escapeHTML(drink.idDrink)}
            </p>

        `;

    } catch (error) {

        modalBody.innerHTML =
            "<p>Failed to load drink details.</p>";

        console.log(error);

    }

}




function openModal() {

    detailsModal.classList.add("show");

}

function closeModal() {

    detailsModal.classList.remove("show");

}

closeModalButton.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", closeModal);

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        closeModal();

    }

});



searchButton.addEventListener("click", searchDrinks);

searchInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        searchDrinks();

    }

});


function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function(character) {

        const entities = {

            "&": "&amp;",

            "<": "&lt;",

            ">": "&gt;",

            '"': "&quot;",

            "'": "&#039;"

        };

        return entities[character];

    });

}


loadDefaultDrinks();

updateGroupList();
