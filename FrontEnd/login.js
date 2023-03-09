// --------------------------------------------------------------------------------------//
// Je fais appel à une API de validation pour que les champs soient correctement renseignés

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

// -------------------------------------------------------------------------//
// Je fais un appel fetch pour récupérer le userId et token d'authentification

const urlBase = "http://localhost:5678/api";
const urlLogin = urlBase + "/users/login";

// Je pointe ma classe html .form et ajoute un événement sur le submit
document
  .querySelector(".form")
  .addEventListener("submit", async function (event) {
    try {
      // J'annule le comportement par défaut du navigateur (chargement d'une nouvelle page à la validation du formulaire)
      event.preventDefault();

      // Je récupère les données eventuellement stockées dans le localStorage
      let dataResponse = window.localStorage.getItem("dataResponse");

      let messageErreurLogin = document.querySelector(".erreur-login");

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
        dataResponse = await response.json();

        // Je crée une condition pour rediriger l'utilisateur sur la page home en cas de connexion
        if ("token" in dataResponse) {
          document.location.href = "index.html";

          //Je convertis dataResponse en JSON avant de les enregistrer dans localStorage
          const valeurData = JSON.stringify(dataResponse);
          // Stockage des informations dans le localStorage
          window.localStorage.setItem("dataResponse", valeurData);
        } else {
          // Si erreur connexion, je renvoie un msg d'erreur
          messageErreurLogin.style.visibility = "visible";
        }
      } else {
        //Si les données sont déjà sauvegardées, je les reconstruis en mémoire, afin de rester connecté tant que pas déloguée
        dataResponse = JSON.parse(dataResponse);
      }
    } catch (error) {
      console.error(error);
    }
  });

// je recupère les data et je les parse
let dataResponse = window.localStorage.getItem("dataResponse");
dataResponse = JSON.parse(dataResponse);
// pour rediriger automatiquement vers la page index si logged
if (dataResponse !== null && "token" in dataResponse) {
  document.location.href = "index.html";
}
