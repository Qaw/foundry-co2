import { Hitpoints } from "../ui/hitpoints.js";

export default function registerHooks() {


  Hooks.on("renderChatMessage", (message, html, data) => {
    // Affiche ou non les boutons d'application des dommages
    if (game.settings.get("co", "displayChatDamageButtonsToAll")) {
      html.find(".apply-dmg").click((ev) => Hitpoints.onClickChatMessageApplyButton(ev, html, data));
    } else {
      if (game.user.isGM) {
        html.find(".apply-dmg").click((ev) => Hitpoints.onClickChatMessageApplyButton(ev, html, data));
      } else {
        html.find(".apply-dmg").each((i, btn) => {
          btn.style.display = "none";
        });
        html.find(".dr-checkbox").each((i, btn) => {
          btn.style.display = "none";
        });
      }
    }

    // Affiche ou non la difficulté
    const displayDifficulty = game.settings.get("co", "displayDifficulty");
    if (displayDifficulty === "none" || (displayDifficulty === "gm" && !game.user.isGM)) {
      html.find(".display-difficulty").each((i, elt) => {
        elt.remove();
      });
    }
  });

}