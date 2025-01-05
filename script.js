const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const mealList = document.getElementById('mealList');
const modalContainer = document.querySelector('.modal-container');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipeCloseBtn');
const showFavoritesBtn = document.getElementById('showFavorites');
const favoriteMeals = JSON.parse(localStorage.getItem('favoriteMeals')) || [];

// Event listeners
searchButton.addEventListener('click', async () => {
    const ingredient = searchInput.value.trim();
    if (ingredient) {
        const meals = await searchMealsByIngredient(ingredient);
        displayMeals(meals);
    }
});

mealList.addEventListener('click', async (e) => {
    const card = e.target.closest('.meal-item');
    const favoriteBtn = e.target.closest('.favorite-btn');
    const removeFavoriteBtn = e.target.closest('.remove-favorite-btn');

    if (favoriteBtn) {
        const mealId = favoriteBtn.closest('.meal-item').dataset.id;
        addToFavorites(mealId);
    } else if (removeFavoriteBtn) {
        const mealId = removeFavoriteBtn.closest('.meal-item').dataset.id;
        removeFromFavorites(mealId); // Silme işlemi
    } else if (card) {
        const mealId = card.dataset.id;
        const meal = await getMealDetails(mealId);
        if (meal) {
            showMealDetailsPopup(meal);
        }
    }
});

// Function to fetch meals by ingredient
async function searchMealsByIngredient(ingredient) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        const data = await response.json();
        return data.meals;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to fetch meal details by ID
async function getMealDetails(mealId) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await response.json();
        return data.meals[0];
    } catch (error) {
        console.error('Error fetching meal details:', error);
    }
}

// Function to display meals in the list
function displayMeals(meals) {
    mealList.innerHTML = '';
    if (meals) {
        meals.forEach((meal) => {
            const mealItem = document.createElement('div');
            mealItem.classList.add('meal-item');
            mealItem.dataset.id = meal.idMeal;
            mealItem.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h3>${meal.strMeal}</h3>
                <button class="favorite-btn">Add to Favorites</button>
            `;
            mealList.appendChild(mealItem);
        });
    } else {
        mealList.innerHTML = '<p>No meals found. Try another ingredient.</p>';
    }
}

// Function to display meal details on popup
function showMealDetailsPopup(meal) {
    mealDetailsContent.innerHTML = `
        <h2 class="recipe-title">${meal.strMeal}</h2>
        <p class="recipe-category">${meal.strCategory}</p>
        <div class="recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class="recipe-img">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        </div>
        <div class="recipe-video">
            <a href="${meal.strYoutube}" target="_blank">Video Tutorial</a>
        </div>
    `;
    modalContainer.style.display = 'block';
}

// Function to add a meal to favorites
function addToFavorites(mealId) {
    if (!favoriteMeals.includes(mealId)) {
        favoriteMeals.push(mealId);
        localStorage.setItem('favoriteMeals', JSON.stringify(favoriteMeals));
        //alert('Added to favorites!');
    } else {
        //alert('Already in favorites!');
    }
}

// Function to display favorites
function displayFavorites() {
    mealList.innerHTML = '';
    if (favoriteMeals.length === 0) {
        mealList.innerHTML = '<p>No favorites yet. Add some meals!</p>';
        return;
    }

    favoriteMeals.forEach(async (mealId) => {
        const meal = await getMealDetails(mealId);
        const mealItem = document.createElement('div');
        mealItem.classList.add('meal-item');
        mealItem.dataset.id = meal.idMeal;
        mealItem.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <h3>${meal.strMeal}</h3>
            <button class="remove-favorite-btn" data-id="${mealId}">Remove from Favorites</button>
        `;
        mealList.appendChild(mealItem);
    });
}

// Function to remove a meal from favorites
function removeFromFavorites(mealId) {
    const index = favoriteMeals.indexOf(mealId);
    if (index !== -1) {
        favoriteMeals.splice(index, 1);
        localStorage.setItem('favoriteMeals', JSON.stringify(favoriteMeals));
       // alert('Removed from favorites!');
        displayFavorites(); // Silindikten sonra favoriler tekrar gösteriliyor
    }
}

// Event listener for popup close button
recipeCloseBtn.addEventListener('click', () => {
    modalContainer.style.display = 'none';
});

// Event listener for "Show Favorites" button
showFavoritesBtn.addEventListener('click', displayFavorites);

// Perform a chicken search on page load
window.addEventListener('load', () => {
    searchInput.value = '';
    searchButton.click();
});
