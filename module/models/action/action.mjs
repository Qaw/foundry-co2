import { Condition } from "./condition.mjs";

export class Action {
  /**
   *
   * @param {*} source L'item de type Equipment ou Capacity à l'origine de l'action
   * @param {*} indice numéro de l'action
   * @param {*} type
   * @param {*} img
   * @param {*} label
   * @param {*} chatFlavor
   * @param {Boolean} visible  Définit si l'action est visible sur la fiche de personnage
   *  Une action sans conditions est visible
   *  Une action dont toutes les conditions sont vraies est visible
   * @param {Boolean} activable Si true : un bouton permet de l'activer ou de la désactiver
   * @param {Boolean} enabled False tant que la Capacité à l'origine n'est pas activée. Les modifiers ne sont pris en compte que si enabled de l'action vaut true
   * @param {Boolean} temporary true si le sort a une durée
   * Sort permanent : activable et temporary à false, enabled à true
   * Sort à durée : temporary à true et activable à true
   * Sort instantané : temporary à false, et activable à true
   * Attaque simple : temporary à false, et activable à true
   * @param {[]} conditions
   * @param {[]modifier} modifiers
   * @param {[]} resolvers
   */
  constructor(
    source = null,
    indice,
    type,
    img,
    label = "",
    chatFlavor = "",
    visible = false,
    activable = false,
    enabled = false,
    temporary = false,
    conditions = [],
    modifiers = [],
    resolvers = []
  ) {
    this.source = source;
    this.indice = indice;
    this.type = type;
    this.img = img;
    this.label = label;
    this.chatFlavor = chatFlavor;
    this.properties = {
      visible: visible,
      activable: activable,
      enabled: enabled,
      temporary: temporary,
    };
    this.conditions = conditions;
    this.modifiers = modifiers;
    this.resolvers = resolvers;
  }

  /**
   * Crée un nouvel objet Action basé sur un objet Action existant.
   * @param {Action} existingAction L'objet Action existant à partir duquel créer le nouvel objet.
   * @returns {Action} Un nouvel objet Action.
   */
  static createFromExisting(existingAction) {
    return new Action(
      existingAction.source,
      existingAction.indice,
      existingAction.type,
      existingAction.img,
      existingAction.label,
      existingAction.chatFlavor,
      existingAction.properties.visible,
      existingAction.properties.activable,
      existingAction.properties.enabled,
      existingAction.properties.temporary,
      existingAction.conditions,
      existingAction.modifiers,
      existingAction.resolvers
    );
  }

  /**
   * Creates an action from a data object.
   */
  static apply(data) {
    Object.assign(this, data);
  }

  /**
   * Creates an empty action.
   */
  static empty() {
    return Action.apply({});
  }

  get hasConditions() {
    return !foundry.utils.isEmpty(this.conditions);
  }

  get hasModifiers() {
    return !foundry.utils.isEmpty(this.modifiers);
  }

  get hasResolvers() {
    return !foundry.utils.isEmpty(this.resolvers);
  }

  /**
   * Update the source of the action and of all the modifiers
   * @param {*} source
   */
  updateSource(source) {
    this.source = source;

    // Update the source of all modifiers
    Object.values(this.modifiers).forEach((element) => {
      element.source = source;
    });
  }

  /**
   * Return true if visible = true there is no condition or all conditions are true
   * Elsewhere returns true if all conditions are true
   * @param {*} item
   */
  isVisible(item) {
    if (this.hasConditions) {
      let conditionsArray = this.conditions.map((cond) => new Condition(cond.subject, cond.predicate, cond.object));
      return conditionsArray.every((condition) => condition.evaluate(item));
    } else return this.properties.visible;
  }

  get chatData() {
    if (this.properties.visible && this.properties.activable) {
      if (this.properties.temporary) {
        if (this.properties.enabled) return [{ label: "Désactiver " + this.label, action: "unactivate", indice: this.indice }];
        else return [{ label: "Activer " + this.label, action: "activate", indice: this.indice }];
      } else {
        if (this.type === "melee" || this.type === "ranged") {
          return [
            { label: this.label + " - Attaque", action: "activate", type: "attack", indice: this.indice },
            { label: this.label + " - Dommages", action: "activate", type: "damage", indice: this.indice },
          ];
        } else {
          return [{ label: this.label, action: "activate", indice: this.indice }];
        }
      }
    }
    return [];
  }

  /**
   * Serialize salient information about this Document when dragging it.
   * @returns {object}  An object of drag data : type "co.action", source and indice
   */
  toDragData() {
    const dragData = { type: "co.action" };
    dragData.source = this.source;
    dragData.indice = this.indice;
    return dragData;
  }
}
