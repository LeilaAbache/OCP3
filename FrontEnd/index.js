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

//------- je fais un appel fetch à l'api pour récupérer les travaux et que je stocke dans une variable ------//
//------- pour la réutiliser autant que necessaire sur index et eventuellement d'autres pages ---------------//

// Je crée une variable avec le lien général de l'api;
const urlBase = "http://localhost:5678/api";

let jsonWorks = null;
const getWorks = async function () {
  jsonWorks = await (await fetch(`${urlBase}/works`)).json();
  return jsonWorks;
};

// Je récupère la galerie HTML dans une variable
const galleryHtml = document.querySelector("#gallery");

// J'insère tout mon code dans une instruction try catch pour regrouper toutes les instructions à exécuter et définir une réponse à afficher si l'une des instruction génère une exception;
//try {
// Je récupère le tableau categories et le tableau works sur l'API grâce à fetch
//   const res = await fetch(`${urlBase}/categories`);
//   console.log("reponse", res);
//   const categories = await res.json();
//   console.log(jsonCategories);
//const jsonWorks = await (await fetch(`${urlBase}/works`)).json();
jsonWorks = await getWorks();

const jsonCategories = await (await fetch(`${urlBase}/categories`)).json();

// Je parcours le tableau des works, je crée les balises html et j'affiche les éléments du tableau;
// Je crée une fonction globale genererWorks pour la mise à jour de la page en fonction des filtres;
const genererWorks = function (jsonWorks) {
  // Je régénère la page avec un body vide pour ensuite afficher correctement les filtres;
  galleryHtml.innerHTML = "";

  for (let jsonWork of jsonWorks) {
    let work = new Work(jsonWork);

    galleryHtml.innerHTML += `<figure>
      <img src=${work.imageUrl}>
      <figcaption>${work.title}</figcaption>
      </figure>`;
  }
};
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
//} catch (err) {
//console.log("Une erreur est survenue", err);
//}

// Je crée un évenement pour effacer les données du localStorage à la deconnexion et redirection vers index
const boutonLogout = document.querySelector(".logout");
boutonLogout.addEventListener("click", function (event) {
  event.preventDefault();
  window.localStorage.removeItem("dataResponse");
  document.location.href = "index.html";
});

//Je récupère les data je les parse pour changer la config html de l'index si connecté ou non
let dataResponse = window.localStorage.getItem("dataResponse");
dataResponse = JSON.parse(dataResponse);

// faire apparaitre les éléments cachés si logged
let homeEditLogin = document.getElementsByClassName("log");

for (let element of homeEditLogin) {
  if (dataResponse !== null && "token" in dataResponse) {
    element.style.display = "flex";
  } else {
    element.style.display = "none";
  }
}

// faire disparaitre le lien "login" si logged
let homeEditLogout = document.getElementsByClassName("login");

for (let element of homeEditLogout) {
  if (dataResponse !== null && "token" in dataResponse) {
    element.style.display = "none";
  } else {
    element.style.display = "flex";
  }
}

//------------ Création de la modale -------------//

let modal = document.getElementById("modal");
let galleryModal = document.querySelector("#gallery-modal");
//variables concernant le focus
const focusableSelector = "button, a, input";
let focusables = [];
let previouslyFocusedElement = null;
let isModalOpen = false;

// Je crée une fonction pour switcher entre la v1 et la v2
function switchModal(id) {
  // TODO: aria
  // les deux v sont en "none" par défaut
  document.getElementById("modal-v1").style.display = "none";
  document.getElementById("modal-v2").style.display = "none";
  // je ferai appel à la fonction pour les rendre "block"
  document.getElementById(id).style.display = "block";
}

// Ouverture de la modale
const openModal = /*async*/ function (e) {
  e.preventDefault();

  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  previouslyFocusedElement = document.querySelector(":focus");
  modal.style.display = null;
  focusables[0].focus();

  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");

  //Je régénère la modale avec une gallery vide pour afficher les éléments mis à jour
  galleryModal.innerHTML = "";
  //Je parcours le tableau des works pour intégrer chaque work dans les éléments html créés en js
  for (let jsonWork of jsonWorks) {
    let work = new Work(jsonWork);

    galleryModal.innerHTML += `<figure>
     <a href="#" class="delete-work" data-id="${work.id}"><i class="fa-solid fa-trash-can"></i></a>
     <img src=${work.imageUrl}>
     <figcaption>Éditer</figcaption>
     </figure>`;
  }

  //Supprimer un work depuis la modale
  document.querySelectorAll(".delete-work").forEach(function (trash) {
    trash.addEventListener("click", function (e) {
      e.preventDefault();
      // // Recup ID
      let workId = this.dataset.id;

      // Appel API delete avec l'ID
      fetch(`${urlBase}/works/${workId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${dataResponse.token}`,
        },
      }).then(async function (response) {
        // GetWorks puis GenererWorks
        jsonWorks = await getWorks();
        genererWorks(jsonWorks);
        // CloseModal
        closeModal();
      });
    });
  });

  //Je fais appel à la fonction pour faire apparaitre la v1 dans ce cas
  switchModal("modal-v1");
  isModalOpen = true;
};

// Fermeture de la modale
const closeModal = function (e) {
  if (previouslyFocusedElement !== null) previouslyFocusedElement.focus();
  if (e) {
    e.preventDefault();
  }

  modal.style.display = "none";

  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");

  isModalOpen = false;
};

// J'évite la fermeture de la modale juste en cliquant sur la modale
// Elle se fermera uniquement si je clique sur la croix ou en cliquant à l'exterieur de la modale
const stopPropagation = function (e) {
  e.stopPropagation();
};

// Une fois la modale ouverte, j'enferme le focus à l'intérieur de la modale
const focusInModal = function (e) {
  e.preventDefault();
  let index = focusables.findIndex((f) => f === modal.querySelector(":focus"));
  if (e.shiftKey) {
    index--;
  } else {
    index++;
  }
  if (index >= focusables.length) {
    index = 0;
  }
  if (index < 0) {
    index = focusables.length - 1;
  }
  focusables[index].focus();
};

//La modale se ferme en cliquant sur la croix v1 ou v2
modal.querySelectorAll(".js-modal-close").forEach(function (btn) {
  btn.addEventListener("click", closeModal);
});
modal.addEventListener("click", closeModal);

//La modale ne se fermera qu'en cliquant à l'exterieur de la modale ou sur la croix
modal
  .querySelector(".modal-wrapper")
  .addEventListener("click", stopPropagation);

//La modale s'ouvre en cliquant sur le lien "modifier"
document.querySelector(".js-modal").addEventListener("click", openModal);

//Je switche sur la v2 en cliquant sur le bouton "Ajout photo"
document.querySelector(".btn-ajout").addEventListener("click", function () {
  switchModal("modal-v2");
});

//Je switche sur la v1 en cliquant sur la flèche retour
document
  .querySelector(".js-retour-modal1")
  .addEventListener("click", function () {
    switchModal("modal-v1");
  });

// Je peux fermer la modale en appuyant sur escape
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModal(e);
  }
  // Je peux tabuler dans la modale avec tab ou shift (en arrière)
  if ((e.key === "Tab" || e.shiftKey) && isModalOpen) {
    focusInModal(e);
  }
});

const imageForm = document.querySelector("#image-form");
var uploadedImage = "";

imageForm.addEventListener("change", function () {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    uploadedImage = reader.result;
    document.querySelector(
      "#display-image"
    ).style.backgroundImage = `url(${uploadedImage})`;
    document.querySelector(".display-image-none").style.display = "none";
  });
  reader.readAsDataURL(this.files[0]);
});
