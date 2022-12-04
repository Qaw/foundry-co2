import { Modifier } from "./modifiers.mjs";

export const CO = {};

// ASCII Artwork
CO.ASCII = `
   ******    *******  
  **////**  **/////**  
 **    //  **     //**      
/**       /**      /** 
/**       /**      /**  
//**    **//**     **       
 //******  //*******        
  //////    ///////   `;

 CO.modifier = {
   type: {
      trait: "CO.modifier.type.trait",
      profile: "CO.modifier.type.profile",
      capacity: "CO.modifier.type.capacity"
   },
   subtype: {
      ability: "CO.modifier.subtype.ability",
      combat: "CO.modifier.subtype.combat",
      attribute: "CO.modifier.subtype.attribute",
      skill: "CO.modifier.subtype.skill"
   },
   target: {
      str: "CO.abilities.long.str",
      dex: "CO.abilities.long.dex",
      con: "CO.abilities.long.con",
      int: "CO.abilities.long.int",
      wis: "CO.abilities.long.wis",
      cha: "CO.abilities.long.cha",
      melee: "CO.combat.long.melee",
      ranged: "CO.combat.long.ranged",
      magic: "CO.combat.long.magic",
      init: "CO.combat.long.init",
      def: "CO.combat.long.def",
      hp: "CO.label.long.hp"
   }
 }
