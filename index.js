//-----------------------------------------------------------------------------------------------//
//----------- Appel fetch à l'API pour récupérer les travaux (works) et les catégories ----------//

// Variable avec le lien général de l'api;
const urlBase = "http://localhost:5678/api";

// Variable qui stockera les travaux, une autre pour les catégories
let jsonWorks = null;
let jsonCategories = null;

// Variable pour pointer la galerie html
const galleryHtml = document.querySelector("#gallery");

// Fonction pour récupérer les travaux (works) via fetch
const getWorks = async function () {
  try {
    return await (await fetch(`${urlBase}/works`)).json();
  } catch (error) {
    alert("Une erreur est survenue, veuillez réessayer ultérieurement", error);
  }
};
// Récupère le tableau des works en les stockant dans la variable jsonWorks
jsonWorks = await getWorks();

// Fonction pour récupérer le tableau Catégories via fetch
const getCategories = async function () {
  try {
    return await (await fetch(`${urlBase}/categories`)).json();
  } catch (error) {
    alert("Une erreur est survenue", error);
  }
};
// Récupère le tableau des catégories en les stockant dans la variable jsonCatégories
jsonCategories = await getCategories();

//------------------------------------------------------------------------------------------//
//-------------------- Création et affichage de la galerie des projets ---------------------//

// Fonction globale genererWorks pour la mise à jour des travaux dans la galerie
const genererWorks = function (jsonWorks) {
  // Régénère la page avec un body vide pour ensuite afficher correctement la mise à jour
  galleryHtml.innerHTML = "";

  // Parcours le tableau des works, crée les balises html et affiche les éléments du tableau;
  for (let jsonWork of jsonWorks) {
    galleryHtml.innerHTML += `<figure>
      <img src="${jsonWork.imageUrl}" alt="${jsonWork.title}">
      <figcaption>${jsonWork.title}</figcaption>
      </figure>`;
  }
};
genererWorks(jsonWorks);

//-----------------------------------------------------------------------------------------//
//-------------------------- Création et affichage des Filtres ----------------------------//

// Crée un bouton pour afficher tous les projets;
const boutonTous = document.createElement("button");
boutonTous.innerText = "Tous";
// Rattache le bouton à son parent HTML;
document.getElementById("filtre-categories").appendChild(boutonTous);

// Boucle qui parcourt le tableau des catégories;
for (let i = 0; i < jsonCategories.length; i++) {
  const elFiltreCategories = document.getElementById("filtre-categories");

  const categorie = jsonCategories[i];

  // Crée les boutons filtre en fonction de leur nom;
  const boutonFiltre = document.createElement("button");
  // Ajoute le nom de la categorie du backend ainsi que son id
  boutonFiltre.innerText = categorie.name;
  boutonFiltre.dataset.catid = categorie.id;
  // Rattache les boutons filtre à leur parent HTML;
  elFiltreCategories.appendChild(boutonFiltre);
}

// Événement au click pour filtrer les works en fonction de leur catégorie
let boutonsFiltre = document.querySelectorAll("#filtre-categories button");
for (let boutonFiltre of boutonsFiltre) {
  boutonFiltre.addEventListener("click", function () {
    const thisButton = this;
    const worksFiltres = jsonWorks.filter(function (workCat) {
      if (!thisButton.dataset.catid) {
        // Si bouton TOUS
        return true; // Garde ce work
      } else if (workCat.category.id == thisButton.dataset.catid) {
        // Si autre bouton : Garde si la cat du Works correspond à la cat du bouton
        return true; // Garde ce work
      }
    });
    // Appel à la fonction qui régénère les works (en vidant d'abord le contenu de la galerie pour ensuite n'afficher que les works liés au click)
    genererWorks(worksFiltres);
  });
}

//---------------------------------------------------------------------------------//
//----------------------------- Les données du localstorage -----------------------//
// Évenement pour effacer les données du localStorage à la deconnexion et redirection vers index
const boutonLogout = document.querySelector(".logout");
boutonLogout.addEventListener("click", function (event) {
  event.preventDefault();
  window.localStorage.removeItem("dataResponse");
  document.location.href = "index.html";
});

// Récupère les data et les parse pour changer la config html de l'index si connecté ou non
let dataResponse = window.localStorage.getItem("dataResponse");
dataResponse = JSON.parse(dataResponse);

//----------------------------------------------------------------------------------//
//---------------------------- Apparition du mode edition --------------------------//
// Fait apparaitre les éléments cachés si logged
let homeEditLogin = document.getElementsByClassName("log");

for (let element of homeEditLogin) {
  if (dataResponse !== null && "token" in dataResponse) {
    element.style.display = "flex";
  } else {
    element.style.display = "none";
  }
}

// Cache le lien "login" si logged
let homeEditLogout = document.getElementsByClassName("login");

for (let element of homeEditLogout) {
  if (dataResponse !== null && "token" in dataResponse) {
    element.style.display = "none";
  } else {
    element.style.display = "flex";
  }
}

//----------------------------------------------------------------------------------//
//------------------------------ Création de la modale -----------------------------//

let modal = document.getElementById("modal");
let galleryModal = document.querySelector("#gallery-modal");

// La modale est fermée par défaut
let isModalOpen = false;

//----------------------------------------------------------------------------------//
//------------------------------- switch modale v1 v2 v3 ---------------------------//
// Fonction pour switcher entre la v1, la v2 ou la v3
function switchModal(id) {
  // les trois v sont en "none" par défaut
  document.getElementById("modal-v1").style.display = "none";
  document.getElementById("modal-v2").style.display = "none";
  document.getElementById("modal-v3").style.display = "none";
  // Appel à la fonction pour les rendre "block"
  document.getElementById(id).style.display = "block";
}

//----------------------------------------------------------------------------------//
//--------------------------------- Ouverture Modale -------------------------------//

const openModal = function (e) {
  e.preventDefault();
  // Régénère la modale avec une gallery vide pour afficher les éléments mis à jour
  galleryModal.innerHTML = "";
  // Parcours le tableau des works pour intégrer chaque work dans des éléments html créés ci-dessous
  for (let jsonWork of jsonWorks) {
    galleryModal.innerHTML += `<figure>
     <a href="#" class="delete-work" data-id="${jsonWork.id}"><i class="fa-solid fa-trash-can"></i></a>
     <img src="${jsonWork.imageUrl}" alt="${jsonWork.title}">
     <figcaption>Éditer</figcaption>
     </figure>`;
  }

  // Annule le display:none pour faire apparaitre la modale
  modal.style.display = null;

  //---------------------------------------------------------------------------//
  //--------------------- Supprimer un work depuis la modale ------------------//
  document.querySelectorAll(".delete-work").forEach(function (trash) {
    trash.addEventListener("click", function (e) {
      e.preventDefault();
      // Récupère l'id du work
      let workId = this.dataset.id;

      // Appel API delete avec l'id
      fetch(`${urlBase}/works/${workId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${dataResponse.token}`,
        },
      })
        .then(async function (response) {
          // Appel aux fonction GetWorks (récup les news travaux de l'API) puis GenererWorks (mise à jour de l'affichage de la galerie)
          jsonWorks = await getWorks();
          genererWorks(jsonWorks);
          // Appel à la fonction closeModale après suppression
          closeModal();
        })
        .catch((error) => {
          alert(
            "Une erreur est survenue lors de la suppression du projet : ",
            error
          );
        });
    });
  });
  // Appel à la fonction pour faire apparaitre la v1 dans ce cas
  switchModal("modal-v1");
  isModalOpen = true;
};

// La modale s'ouvre en cliquant sur le lien "modifier"
document.querySelector(".js-modal").addEventListener("click", openModal);

//-------------------------------------------------------------------------------------//
//-------------------------------- Fermeture de la modale -----------------------------//
const closeModal = function (e) {
  if (e) {
    e.preventDefault();
  }
  // Remets la modale en display:none
  modal.style.display = "none";
  // Efface la photo uploadée, le titre, la selection categorie et les messages d'erreur si closeModal
  removePhoto();
  removeTitle();
  removeCategory();
  messageErrFormModal.style.visibility = "hidden";

  isModalOpen = false;
};

// Évite la fermeture de la modale juste en cliquant sur la modale
// Se fermera uniquement si click sur la croix ou click à l'exterieur de la modale
const stopPropagation = function (e) {
  e.stopPropagation();
};

// Modale se ferme en cliquant sur la croix v1, v2 ou v3
modal.querySelectorAll(".js-modal-close").forEach(function (btn) {
  btn.addEventListener("click", closeModal);
});
modal.addEventListener("click", closeModal);

// Modale ne se fermera qu'en cliquant à l'exterieur de la modale ou sur la croix
modal
  .querySelector(".modal-wrapper")
  .addEventListener("click", stopPropagation);

// Switche sur la v2 en cliquant sur le bouton "Ajout photo"
document.querySelector(".btn-ajout").addEventListener("click", function () {
  switchModal("modal-v2");
});

// Switche sur la v1 en cliquant sur la flèche retour
document
  .querySelector(".js-retour-modal1")
  .addEventListener("click", function () {
    switchModal("modal-v1");
    removePhoto();
    removeTitle();
    removeCategory();
    messageErrFormModal.style.visibility = "hidden";
  });

// Fermer la modale en appuyant sur escape
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModal(e);
  }
});

//---------------------------------------------------------------------------------//
//--------------------------- Effacer le contenu du formulaire --------------------//
// Fonction effacer la photo uploadée
function removePhoto() {
  imageForm.value = null;
  document.querySelector("#display-image").style.backgroundImage = null;
  document.querySelector(".display-image-none").style.display = "block";
}

// Fonction effacer le titre
const titleForm = document.querySelector("#title");
function removeTitle() {
  titleForm.value = null;
}

// Fonction effacer la categorie selectionnée
const categoryForm = document.querySelector("#category");
function removeCategory() {
  categoryForm.value = null;
}

//---------------------------------------------------------------------------------//
//------------------------ Upload photo dans le formulaire ------------------------//
const imageForm = document.querySelector("#image");
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

//--------------------------------------------------------------------------------//
//------------------ Création liste déroulante formulaire modale -----------------//

// Crée les <options> de la balise <select> en parcourant la liste des catégories de l'API

for (let i = 0; i < jsonCategories.length; i++) {
  const selectForm = document.getElementById("category");

  const categorie = jsonCategories[i];

  const optionForm = document.createElement("option");
  optionForm.innerText = categorie.name;
  optionForm.value = categorie.id;

  selectForm.appendChild(optionForm);
}

//--------------------------------------------------------------------------------//
//---------------------- Changement couleur bouton submit ------------------------//

// Bouton Valider passera de gris à vert si tous les champs sont remplis
function submitFormColor() {
  if (
    imageForm.value.length > 0 &&
    titleForm.value.length > 0 &&
    categoryForm.value.length > 0
  ) {
    document.querySelector(".btn-submit-modal").style.background = "#1D6154";
  } else {
    document.querySelector(".btn-submit-modal").style.background = "grey";
  }
}

imageForm.addEventListener("change", submitFormColor);
titleForm.addEventListener("keyup", submitFormColor);
categoryForm.addEventListener("change", submitFormColor);

//--------------------------------------------------------------------------------//
//-------------------- Envoi des données du formulaire modale --------------------//

// Récupère les données du formulaire
const projectForm = document.querySelector(".modal-form");
let messageErrFormModal = document.querySelector(".erreur-form-modal");

projectForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(projectForm);
  const image = formData.get("image");
  const title = formData.get("title");
  const category = formData.get("category");

  // Instruction if pour contrôler la validité de tous les champs
  if (image.size == 0) {
    messageErrFormModal.innerText = "Veuillez mettre une image";
    messageErrFormModal.style.visibility = "visible";
    return 0;
  }

  if (image.size > 4194304) {
    messageErrFormModal.innerText =
      "Veuillez mettre une image dont la taille est < à 4mo";
    messageErrFormModal.style.visibility = "visible";
    removePhoto();
    return 0;
  }

  if (title.length == 0) {
    messageErrFormModal.innerText = "Veuillez mettre un titre";
    messageErrFormModal.style.visibility = "visible";
    return 0;
  }

  if (!category) {
    messageErrFormModal.innerText = "Veuillez selectionner une catégorie";
    messageErrFormModal.style.visibility = "visible";
    return 0;
  }

  // Envoie les données du nouveau projet en POST via fetch
  fetch(`${urlBase}/works`, {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${dataResponse.token}`,
    },
    body: formData,
  })
    .then(async function (response) {
      // GetWorks puis GenererWorks pour mettre à jour les données sur la modale et la gallery
      jsonWorks = await getWorks();
      genererWorks(jsonWorks);
      // Si validation des données ok, switch vers la v3 pour message de réussite
      switchModal("modal-v3");
    })
    .catch((error) => {
      alert(
        "Une erreur est survenue lors de l'envoi des données du formulaire : " +
          error.message
      );
    });
});
