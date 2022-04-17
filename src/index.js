import axios from 'axios';
import { Spinner } from 'spin.js';

const recipeContainer = document.getElementById('recipe-container');
const getMealRecipeButton = document.getElementById('get-recipe');

const getMeal = async () => {
  try {
    const response = await axios.get(
      'https://www.themealdb.com/api/json/v1/1/random.php'
    );

    const {
      data: { meals },
    } = response;

    return meals;
  } catch (err) {
    throw err;
  }
};

const timer = (seconds) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      return reject(
        new Error('Took too much time loading the recipe! Try again..')
      );
    }, seconds * 1000);
  });
};

const spinnerOpts = {
  lines: 11, // The number of lines to draw
  length: 38, // The length of each line
  width: 17, // The line thickness
  radius: 42, // The radius of the inner circle
  scale: 0.35, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-fade-default', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#0137ba', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  top: '250%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  zIndex: 2000000000, // The z-index (defaults to 2e9)
  className: 'spinner', // The CSS class to assign to the spinner
  position: 'absolute', // Element positioning
};

const mealTemplate = (data, ingredientsAndMeasurementsArr = []) => {
  const youtubeEmbedLink = data.strYoutube.split('=').pop();

  const markup = `
  <div class="bg-light border rounded p-2">
  <div class="row">
    <h3 class="fs-2 fw-bold">${data.strMeal}</h3>
    <div class="d-flex">
      <p class="border-end pe-2 me-2">
        <span class="fw-bold">Category:</span> ${data.strCategory}
      </p>
      <p>
        <span class="fw-bold">Area:</span> ${data.strArea}
      </p>
    </div>
  </div>
  <div class="row my-5">
    <div class="col-sm-12 col-md-4">
      <h4 class="mb-4 border-bottom pb-2">${
        ingredientsAndMeasurementsArr.length
      } Ingredients</h4>
      <ul class="ingredients">
        ${ingredientsAndMeasurementsArr
          .map((ingAndMeas) => {
            return `<li class="mb-3"><i class="fa-solid fa-basket-shopping me-2"></i>${ingAndMeas[0]} - ${ingAndMeas[1]}</li>`;
          })
          .join('')}
      </ul>
    </div>
    <div class="col-sm-12 col-md-8">
      <h4 class="mb-4 border-bottom pb-2">Instructions</h4>
      <p>${data.strInstructions}</p>
    </div>
  </div>
  <div class="row">
    <div class="col-12 text-center">
      <h3 class="fw-bold mb-3">Recipe Video:</h3>
        <iframe
          width="560px"
          height="315px"
          src="https://www.youtube.com/embed/${youtubeEmbedLink}"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
    </div>
  </div>
  </div>
  `;

  return markup;
};

const exctractIngredientsAndMeasurements = (data) => {
  const ingredients = [];

  const measurements = [];

  Object.keys(data).forEach((key) => {
    const [phrase] = key.match(/[a-zA-z]+/g);

    if (phrase === 'strIngredient' && data[key]?.length > 0)
      ingredients.push(data[key]);

    if (phrase === 'strMeasure' && data[key]?.length > 0)
      measurements.push(data[key]);
  });

  return ingredients.map((ing, i) => [ing, measurements[i]]);
};

const renderMealRecipe = async () => {
  let html, spinner;

  try {
    recipeContainer.textContent = '';

    spinner = new Spinner(spinnerOpts).spin(recipeContainer);

    const mealData = await Promise.race([timer(3), getMeal()]);

    spinner.stop();

    const [data] = mealData;

    const ingredientsAndMeasurements = exctractIngredientsAndMeasurements(data);

    html = mealTemplate(data, ingredientsAndMeasurements);

    recipeContainer.insertAdjacentHTML('afterbegin', html);
  } catch (err) {
    spinner.stop();
    html = `<h3 class="text-danger fw-bold">${err.message}</h3>`;
    recipeContainer.insertAdjacentHTML('afterbegin', html);
  }
};

getMealRecipeButton.addEventListener('click', renderMealRecipe);
