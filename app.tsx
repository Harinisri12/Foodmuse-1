/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import axios from "axios";
import { Plus, X } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { UserProvider, useUser } from "./context/UserContext";
import { Login } from './components/Login';
import { Register } from './components/Register';

const API_KEY = "7cc22059637841c1bb9c2fcd98cc9374";

function IngredientInput({ onGenerateRecipes }: { onGenerateRecipes: (ingredients: string[]) => void }) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");


  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };


  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };


  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={currentIngredient}
          onChange={(e) => setCurrentIngredient(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addIngredient()}
          placeholder="Enter an ingredient..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={addIngredient}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add
        </button>
      </div>


      <div className="flex flex-wrap gap-2 mb-4">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
            <span>{ingredient}</span>
            <button onClick={() => removeIngredient(index)} className="hover:text-emerald-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>


      <button onClick={() => onGenerateRecipes(ingredients)} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
        Generate Recipes
      </button>
    </div>
  );
}


function AppContent() {
  const { user, setUser, tempRegistrationData, setTempRegistrationData } = useUser();
  const [isRegistering, setIsRegistering] = useState(true);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleLogin = (email: string) => {
    // Use the stored registration data if available, otherwise fallback to email
    if (tempRegistrationData && tempRegistrationData.email === email) {
      setUser(tempRegistrationData);
    } else {
      const username = email.split('@')[0];
      setUser({ username, email, fullName: username });
    }
  };


const handleRegister = (username: string, email: string, fullName: string) => {
  const userData = { username, email, fullName };
  setTempRegistrationData(userData);
  setIsRegistering(false); // Automatically switch to login
};


  if (!user) {
    return isRegistering ? (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setIsRegistering(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setIsRegistering(true)}
      />
    );
  }


  const fetchRecipes = async (ingredients: string[]) => {
    if (ingredients.length === 0) {
      setError("Please enter at least one ingredient.");
      return;
    }
    setError(null);
    setLoading(true);
    setRecipes([]);


    try {
      const response = await axios.get(
        "https://api.spoonacular.com/recipes/findByIngredients",
        {
          params: {
            ingredients: ingredients.join(","),
            apiKey: API_KEY,
          },
        }
      );


      const recipePromises = response.data.map(async (recipe: any) => {
        const nutrition = await axios.get(
          `https://api.spoonacular.com/recipes/${recipe.id}/nutritionWidget.json`,
          {
            params: { apiKey: API_KEY },
          }
        );
        return { ...recipe, nutrition: nutrition.data };
      });


      const recipesWithNutrition = await Promise.all(recipePromises);
      setRecipes(recipesWithNutrition);
    } catch (err) {
      setError("Failed to fetch recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  const openRecipeInNewTab = async (recipe: any) => {
    try {
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/${recipe.id}/information`,
        {
          params: { apiKey: API_KEY },
        }
      );


      const nutritionLabel = await axios.get(
        `https://api.spoonacular.com/recipes/${recipe.id}/nutritionLabel`,
        {
          params: { apiKey: API_KEY },
        }
      );


      const cardResponse = await axios.get(
        `https://api.spoonacular.com/recipes/${recipe.id}/card`,
        {
          params: { apiKey: API_KEY },
        }
      );


      const newTab = window.open("", "_blank");
      if (newTab) {
        newTab.document.write(`
          <html>
            <head>
              <title>${response.data.title}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  padding: 30px;
                  margin: 0;
                  background-color: #f5f5f5;
                  color: #333;
                }
                h1 {
                  font-size: 2.5rem;
                  margin-bottom: 30px;
                  color: #047857;
                  text-align: center;
                }
                .container {
                  display: flex;
                  justify-content: space-between;
                  gap: 30px;
                  max-width: 1200px;
                  margin: 0 auto;
                }
                .nutrition {
                  width: 320px;
                  padding: 25px;
                  background-color: #ffffff;
                  border-radius: 10px;
                  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }
                .nutrition h2 {
                  font-size: 1.75rem;
                  color: #555;
                  margin-bottom: 20px;
                }
                .nutrition-widget {
                  font-size: 1rem;
                  color: #666;
                }
                .recipe-details {
                  flex: 1;
                  background-color: #ffffff;
                  padding: 25px;
                  border-radius: 10px;
                  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }
                .recipe-details img {
                  max-width: 100%;
                  height: auto;
                  margin-bottom: 25px;
                  border-radius: 10px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .recipe-card {
                  max-width: 100%;
                  margin-top: 20px;
                  border-radius: 10px;
                }
                .recipe-details h2 {
                  font-size: 1.75rem;
                  color: #555;
                  margin-bottom: 15px;
                }
                ul {
                  list-style-type: none;
                  padding: 0;
                  margin-bottom: 20px;
                }
                li {
                  font-size: 1rem;
                  color: #666;
                  margin-bottom: 12px;
                  line-height: 1.5;
                }
                p {
                  font-size: 1.125rem;
                  color: #555;
                  line-height: 1.6;
                }
                .recipe-details ul {
                  margin-top: 20px;
                }
                .back-button {
                  margin-top: 20px;
                  padding: 10px 20px;
                  background-color: #047857;
                  color: white;
                  border-radius: 5px;
                  text-decoration: none;
                  font-size: 1rem;
                  display: inline-block;
                  transition: background-color 0.3s;
                }
                .back-button:hover {
                  background-color: #047857;
                }
              </style>
            </head>
            <body>
              <h1>${response.data.title}</h1>
              <div class="container">
                <div class="nutrition">
                  <div class="nutrition-widget">
                    ${nutritionLabel.data}
                  </div>
                </div>
                <div class="recipe-details">
                  <center><img src="${response.data.image}" alt="${response.data.title}" /></center>
                  <h2>Ingredients:</h2>
                  <ul>
                    ${response.data.extendedIngredients.map((i: any) => `<li>${i.original}</li>`).join("")}
                  </ul>
                  <h2>Instructions:</h2>
                  <p>${response.data.instructions}</p>
                  <h2>Recipe Card:</h2>
                  <img src="${cardResponse.data.url}" alt="Recipe Card" class="recipe-card"/>
                  <a href="javascript:window.close();" class="back-button">Close</a>
                </div>
              </div>
            </body>
          </html>
        `);
        newTab.document.close();
      }
    } catch (err) {
      console.error("Failed to open recipe in a new tab.", err);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={user?.fullName} onLogout={() => setUser(null)} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Food Muse!</h1>
          <p className="text-lg text-gray-600">Enter your ingredients and let's create something delicious</p>
        </div>


        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">What's in your kitchen?</h2>
          <IngredientInput onGenerateRecipes={fetchRecipes} />


          {loading && <p className="text-emerald-600">Loading recipes...</p>}
          {error && <p className="text-red-600">{error}</p>}


          <div className="mt-6">
            {recipes.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold mb-4">Recipes:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-4 cursor-pointer"
                      onClick={() => openRecipeInNewTab(recipe)}
                    >
                      <img src={recipe.image} alt={recipe.title} className="w-full h-40 object-cover rounded-md mb-4" />
                      <h4 className="font-semibold text-lg mb-2">{recipe.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Used ingredients: {recipe.usedIngredients.map((i: any) => i.name).join(", ")}
                      </p>
                      <p className="text-sm text-gray-600">
                        Missed ingredients: {recipe.missedIngredients.map((i: any) => i.name).join(", ")}
                      </p>
                      <div className="mt-4 text-sm text-gray-600">
                        <p>Calories: {recipe.nutrition.calories}</p>
                        <p>Carbs: {recipe.nutrition.carbs}</p>
                        <p>Protein: {recipe.nutrition.protein}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}


export default App;


