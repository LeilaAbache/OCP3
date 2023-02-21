class Work {
  constructor(jsonWork) {
    jsonWork && Object.assign(this, jsonWork);
  }
}

class Categorie {
  constructor(jsonCategorie) {
    jsonCategorie && Object.assign(this, jsonCategorie);
  }
}

// Je crée une variable avec le lien général de l'api;
const urlBase = "http://localhost:5678/api";
const galleryHtml = document.querySelector("#gallery");

// J'insère tout mon code dans une instruction try catch pour regrouper toutes les instructions à exécuter et définir une réponse à afficher si l'une des instruction génère une exception;
try {
  // Je récupère le tableau categories et le tableau works sur l'API grâce à fetch
  //   const res = await fetch(`${urlBase}/categories`);
  //   console.log("reponse", res);
  //   const categories = await res.json();
  //   console.log(jsonCategories);
  const jsonWorks = await (await fetch(`${urlBase}/works`)).json();
  console.log(jsonWorks);

  const jsonCategories = await (await fetch(`${urlBase}/categories`)).json();
  console.log(jsonCategories);

  // Je parcours le tableau des works, je crée les balises html et j'affiche les éléments du tableau;
  // Je crée une fonction globale genererWorks pour la mise à jour de la page en fonction des filtres;
  function genererWorks(jsonWorks) {
    // Je régénère la page avec un body vide pour ensuite afficher correctement les filtres;
    galleryHtml.innerHTML = "";

    for (let jsonWork of jsonWorks) {
      let work = new Work(jsonWork);

      galleryHtml.innerHTML += `<figure>
      <img src=${work.imageUrl}>
      <figcaption>${work.title}</figcaption>
      </figure>`;
    }
  }
  genererWorks(jsonWorks);

  // Je crée un bouton pour afficher tous les éléments du tableau au click;
  const boutonTous = document.createElement("button");
  boutonTous.innerText = "Tous";

  // Je rattache le bouton à son parent HTML;
  document.getElementById("filtre-categories").appendChild(boutonTous);

  // Je crée un évenement pour que tous les élements du tableau se régénèrent au click;
  boutonTous.addEventListener("click", function () {
    genererWorks(jsonWorks);
  });

  // je crée une boucle qui parcourt le tableau des catégories;
  for (let i = 0; i < jsonCategories.length; i++) {
    const elFiltreCategories = document.getElementById("filtre-categories");
    console.log(elFiltreCategories);

    const categorie = jsonCategories[i];

    // Je crée les boutons filtre en fonction de leur nom;
    const boutonFiltre = document.createElement("button");
    boutonFiltre.innerText = categorie.name;

    // Je rattache les boutons filtre à leur parent HTML;
    elFiltreCategories.appendChild(boutonFiltre);

    // Je crée un événement au click pour filtrer sur chaque bouton la catégorie des éléments;
    boutonFiltre.addEventListener("click", function () {
      const categoriesFiltrees = jsonWorks.filter(function (workCat) {
        if (workCat.category.name === categorie.name) {
          return categorie.name;
        }
      });

      genererWorks(categoriesFiltrees);
    });
  }
} catch (err) {
  console.log("Une erreur est survenue", err);
}

// TODO : a mettre dans un autre fichier js
const boutonLogout = document.querySelector(".logout");
boutonLogout.addEventListener("click", function (event) {
  event.preventDefault();
  window.localStorage.removeItem("dataResponse");
  document.location.href = "index.html";
});

let dataResponse = window.localStorage.getItem("dataResponse");
dataResponse = JSON.parse(dataResponse);

let homeEditLogin = document.getElementsByClassName("log");

for (let element of homeEditLogin) {
  if (dataResponse !== null && "token" in dataResponse) {
    element.style.display = "flex";
    console.log("FLEX");
  } else {
    element.style.display = "none";
    console.log("NONE");
  }
}

let homeEditLogout = document.getElementsByClassName("login");

for (let element of homeEditLogout) {
  if (dataResponse !== null && "token" in dataResponse) {
    element.style.display = "none";
    console.log("none");
  } else {
    element.style.display = "flex";
    console.log("flex");
  }
}
