// -------------------------------------
// Je fais appel à une API de validation pour que les champs soient correctement renseignés
// -------------------------------------

// Je pointe le submit auquel je crée un évenement au click
document
  .querySelector('.form input[type="submit"]')
  .addEventListener("click", function () {
    var valid = true;
    // Je parcours tous les inputs
    for (let input of document.querySelectorAll(".form input")) {
      // Je crée une instruction if pour contrôler la validité de tous les champs
      // équivaut à valid = valid && input.reportValidity();
      valid &= input.reportValidity();
      // Si champs non valide, la validaton s'arrête et ne poursuit pas sur les autres champs
      if (!valid) {
        break;
      }
    }
  });

// -------------------------------------
// Je fais un appel fetch pour récupérer le userId et token d'authentification
// -------------------------------------

const urlBase = "http://localhost:5678/api";
const urlLogin = urlBase + "/users/login";

// Je pointe ma classe html .form et ajoute un événement sur le submit
document
  .querySelector(".form")
  .addEventListener("submit", async function (event) {
    // J'annule le comportement par défaut du navigateur (chargement d'une nouvelle page à la validation du formulaire)
    event.preventDefault();

    // Je récupère les données eventuellement stockées dans le localStorage
    let dataResponse = window.localStorage.getItem("dataResponse");

    // Si aucune donnée sauvegardée dans le localStorage
    if (dataResponse === null) {
      // J'envoie les données de connexion et demande à récupérer une reponse via fetch
      const response = await fetch(urlLogin, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: document.getElementById("email").value,
          password: document.getElementById("mot-de-passe").value,
        }),
      });
      const dataResponse = await response.json();

      // Je crée une condition pour rediriger l'utilisateur sur page home en cas de connexion réussie sinon message d'erreur en alerte
      if ("token" in dataResponse) {
        function RedirectionJavascript() {
          document.location.href = "index.html";

          //Je convertis dataResponse en JSON avant de les enregistrer dans localStorage
          const valeurData = JSON.stringify(dataResponse);
          // Stockage des informations dans le localStorage
          window.localStorage.setItem("dataResponse", valeurData);
        }

        RedirectionJavascript();
      } else {
        alert("Email ou mot de passe incorrect");
      }
    } else {
      //Si les données sont déjà sauvegardées, je les reconstruis en mémoire
      dataResponse = JSON.parse(dataResponse);
    }
  });

const boutonLogout = document.querySelector(".log");
boutonLogout.addEventListener("click", function (event) {
  event.preventDefault();
  window.localStorage.removeItem("dataResponse");
  document.location.href = "index.html";
});
