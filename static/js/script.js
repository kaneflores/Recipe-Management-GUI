////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Login Code Functionality
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let username = 'Placeholder';

document.getElementById("login-button").addEventListener("click", function () {
  const data = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  
  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({data, password})
  })
  .then(response => response.text())
  .then(result => {
    const pass = result.substring(result.indexOf('[[') + 3, result.indexOf(']]')-1);
    if(pass){
      document.getElementById("login-section").style.display = "none";

      document.getElementById("content-section").style.display = "block";

      document.getElementById("user-name").textContent = data;
      username = data;
    } else {
      alert("Invalid username or password. Please try again.");
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create Account Code Functionality
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById("create-account-nav").addEventListener("click", function () {
  document.getElementById("login-section").style.display = "none";
  document.getElementById("create-account-section").style.display = "block";
});

document.getElementById("create-account-button").addEventListener("click", function () {
  const username = document.getElementById("new-username").value.trim();
  const password = document.getElementById("new-password").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!username || !password || !email) {
      alert("Please fill out all fields.");
      return;
  }

  fetch('/create-account', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, email })
  })
  .then(response => response.json())
  .then(result => {
      if (result.success) {
          alert(result.message);
          document.getElementById("create-account-section").style.display = "none";
          document.getElementById("login-section").style.display = "block";
      } else {
          alert(result.message);
      }
  })
  .catch(error => {
      console.error("Error:", error);
      alert("An error occurred while creating the account. Please try again.");
  });
});

document.getElementById("back-to-login").addEventListener("click", function () {
  document.getElementById("create-account-section").style.display = "none";
  document.getElementById("login-section").style.display = "block";
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Logout Code Functionality
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("logout-button").addEventListener("click", function () {
  username = 'Placeholder';

  document.getElementById("content-section").style.display = "none";
  document.getElementById("login-section").style.display = "block";

  document.getElementById("user-name").textContent = "";

  alert("You have been logged out successfully.");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Code for Favorite Recipes 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("back-to-main-favorites").addEventListener("click", function () {
  document.getElementById("favorited-recipes-section").style.display = "none"; 
  document.getElementById("content-section").style.display = "block"; 
});

document.getElementById("favorited-recipes-button").addEventListener("click", function () {
  document.getElementById("content-section").style.display = "none"; 
  document.getElementById("favorited-recipes-section").style.display = "block";

  const recipeListDiv = document.getElementById("favorited-recipes-list");
  recipeListDiv.innerHTML = "<p>Loading favorites...</p>";

  fetch('/favorite', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: username })
  })
  .then(response => response.json())
  .then(result => {
      recipeListDiv.innerHTML = ""; 
      const recipes = result.data;

      if (recipes.length === 0) {
          const noFavoritesMessage = document.createElement("p");
          noFavoritesMessage.textContent = "No favorite recipes found!";
          noFavoritesMessage.style.textAlign = "center";
          recipeListDiv.appendChild(noFavoritesMessage);
      } else {
          recipes.forEach(recipe => {
              const recipeItem = document.createElement("div");
              recipeItem.className = "recipe-item";
              recipeItem.textContent = recipe; 
              recipeListDiv.appendChild(recipeItem);
          });
      }
  })
  .catch(error => {
      console.error("Error:", error);
      recipeListDiv.innerHTML = "<p>An error occurred while fetching favorite recipes. Please try again.</p>";
  });
});

document.getElementById("favorited-recipes-list").addEventListener("click", function (e) {
  if (e.target && e.target.classList.contains("recipe-item")) {
    const recipeName = e.target.textContent;
    showFavoriteRecipeDetails(recipeName);
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Code for sorting by meal type. 
// Ex. Breakfast, Lunch, or Dinner
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.querySelectorAll(".category-button").forEach(button => {
  button.addEventListener("click", function () {
    const mealType = this.textContent;
    displayMealRecipes(mealType); 
  });
});

// Function to display recipes for a meal type
function displayMealRecipes(mealType) {
  document.getElementById("content-section").style.display = "none"; 
  document.getElementById("meal-recipes-section").style.display = "block"; 

  document.getElementById("meal-type-title").textContent = `${mealType} Recipes`;
  const recipeListDiv = document.getElementById("meal-recipe-list");
  recipeListDiv.innerHTML = ""; 
  fetch('/recipes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({data: mealType})
  })
  .then(response => response.json())
  .then(result => {
    const recipeDatabase = result.data;
    recipeDatabase.forEach(recipe => {
      const recipeItem = document.createElement("div");
      recipeItem.className = "recipe-item";
      recipeItem.textContent = recipe; 
      recipeListDiv.appendChild(recipeItem);
    });
  })
  .catch(error => {
    console.error('Error:', error);
      const errorMessage = document.createElement("div");
      errorMessage.className = "error-message";
      errorMessage.textContent = "An error occurred while fetching recipes. Please try again.";
      recipeListDiv.appendChild(errorMessage);
  });  
}

document.getElementById("meal-recipe-list").addEventListener("click", function (e) {
  if (e.target && e.target.classList.contains("recipe-item")) {
    const recipeName = e.target.textContent;
    showRecipeDetails(recipeName);
  }
});

document.getElementById("back-to-main-recipes").addEventListener("click", function () {
  document.getElementById("meal-recipes-section").style.display = "none";
  document.getElementById("content-section").style.display = "block";
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Search Button Code
// Queries any meals that the user would like to search
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("search-button").addEventListener("click", function () {
  const query = document.getElementById("search-input").value.trim(); 
  
  if (query === "") {
    alert("Please enter a search term.");
    return;
  }

  document.getElementById("content-section").style.display = "none";
  document.getElementById("meal-recipes-section").style.display = "block"; 

  document.getElementById("meal-type-title").textContent = `Searched Recipes`;
  const recipeListDiv = document.getElementById("meal-recipe-list");
  recipeListDiv.innerHTML = ""; 

  fetch('/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({data: query})
  })
  .then(response => response.json())
  .then(result => {
    const recipeDatabase = result.data;
    recipeDatabase.forEach(recipe => {
      const recipeItem = document.createElement("div");
      recipeItem.className = "recipe-item";
      recipeItem.textContent = recipe; 
      recipeListDiv.appendChild(recipeItem);
    });
  })
  .catch(error => {
    console.error('Error:', error);
      const errorMessage = document.createElement("div");
      errorMessage.className = "error-message";
      errorMessage.textContent = "An error occurred while fetching recipes. Please try again.";
      recipeListDiv.appendChild(errorMessage);
  });  
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Shopping list code
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("shopping-list-button").addEventListener("click", function () {
  document.getElementById("content-section").style.display = "none";
  document.getElementById("shopping-list-section").style.display = "block";

  const recipeContainer = document.getElementById("recipe-list");
  recipeContainer.innerHTML = "<p>Loading recipes...</p>";

  fetch('/favorites-with-ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: username }) 
  })
  .then(response => response.json())
  .then(result => {
      recipeContainer.innerHTML = ""; 
      const recipes = result.data;

      if (Object.keys(recipes).length === 0) {
          recipeContainer.innerHTML = "<p>No favorite recipes found!</p>";
          return;
      }

      Object.keys(recipes).forEach(recipeId => {
          const recipe = recipes[recipeId];

          const dropdownButton = document.createElement("button");
          dropdownButton.className = "recipe-dropdown";
          dropdownButton.textContent = `${recipe.name} ▼`;

          const ingredientList = document.createElement("ul");
          ingredientList.style.display = "none";
          ingredientList.className = "ingredient-list";

          recipe.ingredients.forEach(ingredient => {
              const ingredientItem = document.createElement("li");
              ingredientItem.textContent = `${ingredient.amount} ${ingredient.name}`;
              ingredientList.appendChild(ingredientItem);
          });

          dropdownButton.addEventListener("click", function () {
            if (ingredientList.style.display === "none") {
                ingredientList.style.display = "block";
            } else {
                ingredientList.style.display = "none";
            }
        });


          recipeContainer.appendChild(dropdownButton);
          recipeContainer.appendChild(ingredientList);
      });
  })
  .catch(error => {
      console.error("Error:", error);
      recipeContainer.innerHTML = "<p>An error occurred while fetching recipes. Please try again.</p>";
  });
});

document.getElementById("back-to-main").addEventListener("click", function () {
  document.getElementById("shopping-list-section").style.display = "none";
  document.getElementById("content-section").style.display = "block";
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Recipe view code
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Navigate to recipe details
function showRecipeDetails(recipeName) {
  fetch('/recipe-details', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recipe_name: recipeName })
  })
  .then(response => response.json())
  .then(result => {
      if (result.success) {
          const recipe = result.data;

          document.getElementById("recipe-title").textContent = recipe.name;
          document.getElementById("recipe-cooking-time").textContent = `Cooking Time: ${recipe.cooking_time} minutes`;

          const ingredientsList = document.getElementById("recipe-ingredients");
          ingredientsList.innerHTML = "";
          recipe.ingredients.forEach(ingredient => {
              const listItem = document.createElement("li");
              listItem.textContent = `${ingredient.amount} ${ingredient.name}`;
              ingredientsList.appendChild(listItem);
          });

          const nutritionList = document.getElementById("recipe-nutrition");
          nutritionList.innerHTML = `
              <li>Protein: ${recipe.nutrition.protein}g</li>
              <li>Fat: ${recipe.nutrition.fat}g</li>
              <li>Carbohydrates: ${recipe.nutrition.carbs}g</li>
              <li>Calories: ${recipe.nutrition.calories}</li>
          `;

          document.getElementById("meal-recipes-section").style.display = "none";
          document.getElementById("recipe-details-section").style.display = "block";
      } else {
          alert(result.message);
      }
  })
  .catch(error => {
      console.error("Error:", error);
      alert("An error occurred while fetching recipe details.");
  });
}

// Navigate to recipe details from favorite recipes 
function showFavoriteRecipeDetails(recipeName) {
  fetch('/recipe-details', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recipe_name: recipeName })
  })
  .then(response => response.json())
  .then(result => {
      if (result.success) {
          const recipe = result.data;

          document.getElementById("favorite-recipe-title").textContent = recipe.name;
          document.getElementById("favorite-recipe-cooking-time").textContent = `Cooking Time: ${recipe.cooking_time} minutes`;


          const ingredientsList = document.getElementById("favorite-recipe-ingredients");
          ingredientsList.innerHTML = "";
          recipe.ingredients.forEach(ingredient => {
              const listItem = document.createElement("li");
              listItem.textContent = `${ingredient.amount} ${ingredient.name}`;
              ingredientsList.appendChild(listItem);
          });

          const nutritionList = document.getElementById("favorite-recipe-nutrition");
          nutritionList.innerHTML = `
              <li>Protein: ${recipe.nutrition.protein}g</li>
              <li>Fat: ${recipe.nutrition.fat}g</li>
              <li>Carbohydrates: ${recipe.nutrition.carbs}g</li>
              <li>Calories: ${recipe.nutrition.calories}</li>
          `;

          document.getElementById("favorited-recipes-section").style.display = "none";
          document.getElementById("favorite-recipe-details-section").style.display = "block";
      } else {
          alert(result.message);
      }
  })
  .catch(error => {
      console.error("Error:", error);
      alert("An error occurred while fetching recipe details.");
  });
}

document.getElementById("back-to-category").addEventListener("click", function () {
  document.getElementById("recipe-details-section").style.display = "none";
  document.getElementById("meal-recipes-section").style.display = "block";
});

document.getElementById("back-to-favorites").addEventListener("click", function () {
  document.getElementById("favorite-recipe-details-section").style.display = "none";
  document.getElementById("favorited-recipes-section").style.display = "block";
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Upload Recipe
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("upload-recipe-nav").addEventListener("click", function () {
  document.getElementById("content-section").style.display = "none";
  document.getElementById("upload-recipe-section").style.display = "block";
});


document.getElementById("upload-recipe-button").addEventListener("click", function () {
  const recipeName = document.getElementById("recipe-name").value.trim();
  const cookingTime = document.getElementById("cooking-time").value.trim();
  const ingredients = [];
  const ingredientItems = document.querySelectorAll(".ingredient-item");

  ingredientItems.forEach(item => {
      const name = item.querySelector(".ingredient-name").value.trim();
      const amount = item.querySelector(".ingredient-amount").value.trim();
      if (name && amount) {
          ingredients.push({ name, amount });
      }
  });

  const nutrition = {
      protein: document.getElementById("protein").value.trim() || null,
      fat: document.getElementById("fat").value.trim() || null,
      carbs: document.getElementById("carbs").value.trim() || null,
      calories: document.getElementById("calories").value.trim() || null
  };

  if (!recipeName || ingredients.length === 0) {
      alert("Please fill out the recipe name and at least one ingredient.");
      return;
  }

  fetch('/upload-recipe', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recipe_name: recipeName, cooking_time: cookingTime, ingredients, nutrition, username: username, })
  })
  .then(response => response.json())
  .then(result => {
      if (result.success) {
          alert(result.message);
          document.getElementById("upload-recipe-form").reset(); 
      } else {
          alert(result.message);
      }
  })
  .catch(error => {
      console.error("Error:", error);
      alert("An error occurred while uploading the recipe. Please try again.");
  });
});

document.getElementById("add-ingredient").addEventListener("click", function () {
  const ingredientsList = document.getElementById("ingredients-list");
  const ingredientItem = document.createElement("div");
  ingredientItem.className = "ingredient-item";

  ingredientItem.innerHTML = `
      <input type="text" class="ingredient-name" placeholder="Ingredient Name" required>
      <input type="text" class="ingredient-amount" placeholder="Amount" required>
  `;
  ingredientsList.appendChild(ingredientItem);
});

document.getElementById("back-to-main-upload").addEventListener("click", function () {
  document.getElementById("upload-recipe-section").style.display = "none";
  document.getElementById("content-section").style.display = "block";
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Read and Write Comments
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("view-comments-button").addEventListener("click", function () {
  const recipeName = document.getElementById("recipe-title").textContent; 
  showComments(recipeName);
});


function showComments(recipeName) {
  document.getElementById("recipe-details-section").style.display = "none";
  document.getElementById("comments-section").style.display = "block";
  document.getElementById("comments-recipe-title").textContent = recipeName;

  const commentsList = document.getElementById("comments-list");
  commentsList.innerHTML = "<p>Loading comments...</p>";

  fetch('/get-comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_name: recipeName })
  })
  .then(response => response.json())
  .then(result => {
      commentsList.innerHTML = ""; 
      if (result.success && result.comments.length > 0) {
          result.comments.forEach(comment => {
              const commentDiv = document.createElement("div");
              commentDiv.className = "comment";
              commentDiv.innerHTML = `
                  <p><strong>${comment.user}:</strong> ${comment.text}</p>
                  <p>Rating: ${comment.rating}/5</p>
              `;
              commentsList.appendChild(commentDiv);
          });
      } else {
          commentsList.innerHTML = "<p>No comments available for this recipe.</p>";
      }
  })
  .catch(error => {
      console.error("Error:", error);
      commentsList.innerHTML = "<p>An error occurred while fetching comments.</p>";
  });
}

document.getElementById("create-comment-button").addEventListener("click", function () {
  document.getElementById("create-comment-form").style.display = "block";
});

document.getElementById("submit-comment-button").addEventListener("click", function () {
  const rating = document.getElementById("comment-rating").value.trim();
  const text = document.getElementById("comment-text").value.trim();
  const recipeName = document.getElementById("comments-recipe-title").textContent;

  if (!rating || !text || rating < 1 || rating > 5) {
      alert("Please provide a valid rating (1-5) and comment.");
      return;
  }

  fetch('/create-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_name: recipeName, username, rating, text })
  })
  .then(response => response.json())
  .then(result => {
      if (result.success) {
          alert(result.message);
          document.getElementById("create-comment-form").reset(); 
          document.getElementById("create-comment-form").style.display = "none"; 
          showComments(recipeName); 
      } else {
          alert(result.message);
      }
  })
  .catch(error => {
      console.error("Error:", error);
      document.getElementById("create-comment-form").reset();
      showComments(recipeName);
  });
});

document.getElementById("back-to-recipe").addEventListener("click", function () {
  document.getElementById("comments-section").style.display = "none";
  document.getElementById("recipe-details-section").style.display = "block";
});

document.getElementById("back-to-recipe").addEventListener("click", function () {
  document.getElementById("comments-section").style.display = "none";
  document.getElementById("recipe-details-section").style.display = "block";
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Nutrition Based Search
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("advanced-search-button").addEventListener("click", function () {
  const panel = document.getElementById("advanced-search-panel");
  if (panel.style.display === "none" || panel.style.display === "") {
      panel.style.display = "block";
  } else {
      panel.style.display = "none";
  }
});

document.getElementById("nutrition-search-button").addEventListener("click", function () {
  const minProtein = document.getElementById("min-protein").value || 0;
  const maxProtein = document.getElementById("max-protein").value || 100;
  const minFat = document.getElementById("min-fat").value || 0;
  const maxFat = document.getElementById("max-fat").value || 100;
  const minCarbs = document.getElementById("min-carbs").value || 0;
  const maxCarbs = document.getElementById("max-carbs").value || 100;
  const minCalories = document.getElementById("min-calories").value || 0;
  const maxCalories = document.getElementById("max-calories").value || 1000;

  fetch('/search-nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          min_protein: parseFloat(minProtein),
          max_protein: parseFloat(maxProtein),
          min_fat: parseFloat(minFat),
          max_fat: parseFloat(maxFat),
          min_carbs: parseFloat(minCarbs),
          max_carbs: parseFloat(maxCarbs),
          min_calories: parseFloat(minCalories),
          max_calories: parseFloat(maxCalories)
      })
  })
  .then(response => response.json())
  .then(result => {
      const recipeListDiv = document.getElementById("meal-recipe-list");
      recipeListDiv.innerHTML = ""; 
      document.getElementById("meal-recipes-section").style.display = "block";
      document.getElementById("content-section").style.display = "none";
      document.getElementById("meal-type-title").textContent = `Nutrition-Based Recipes`;

      if (result.data.length === 0) {
          recipeListDiv.innerHTML = "<p>No recipes found matching the criteria.</p>";
      } else {
          result.data.forEach(recipe => {
              const recipeItem = document.createElement("div");
              recipeItem.className = "recipe-item";
              recipeItem.textContent = `${recipe.name}`;
              recipeListDiv.appendChild(recipeItem);
          });
      }
  })
  .catch(error => {
      console.error("Error:", error);
      alert("An error occurred while searching for recipes. Please try again.");
  });
});


