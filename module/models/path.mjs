import ItemData from "./item.mjs"
import { SYSTEM } from "../config/system.mjs"

/**
 * Define the data schema for a Path
 * subtype : the type of the path
 * capacities : an array of capacities' uuis
 * rank : the rank in the path, will be define when a capacity is learned and unlearned
 */
export default class PathData extends ItemData {
  static defineSchema() {
    const fields = foundry.data.fields
    return foundry.utils.mergeObject(super.defineSchema(), {
      subtype: new fields.StringField({ required: true, choices: SYSTEM.PATH_TYPES, initial: "profile" }),
      capacities: new fields.ArrayField(new fields.DocumentUUIDField({ type: "Item" })),
      rank: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true }),
      maxDefenseArmor: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
    })
  }

  async prepareDerivedData() {
    super.prepareDerivedData()
    this.rank = await this.computeRank()
  }

  /**
   * Computes the rank based on the given capacities.
   * The rank is determined by the highest index (1-based) of the capacities
   * where the system has been learned.
   *
   * @param {Array} capacities An array of capacity objects.
   * @returns {number} The highest rank (1-based index) where the system has been learned.
   */
  static computeRank(capacities) {
    let max = 0
    for (const [index, capacity] of capacities.entries()) {
      if (capacity.system.learned) {
        const rank = index + 1
        if (rank > max) max = rank
      }
    }
    return max
  }

  /** Renvoi la position de la capacité dans la voie
   * @param {Uuid} capacityUuid de la capacité à chercher
   * @returns {integer} Position dans la liste
   */
  async getCapacityRank(capacityUuid) {
    console.log("je cherche ", capacityUuid)
    let rankpos = 0
    for (let i = 0; i < this.capacities.length; i++) {
      console.log("je vois ", this.capacities[i])
      if (this.capacities[i] === capacityUuid) {
        rankpos = i
        break
      }
    }
    return rankpos
  }

  /**
   * Asynchronously retrieves and returns a list of capacities.
   *
   * This method iterates over the `capacities` property of the current instance,
   * retrieves each capacity using the `fromUuid` function, and collects the
   * results in an array.
   *
   * @returns {Promise<Array>} A promise that resolves to an array of capacities.
   */
  async getCapacities() {
    let capacities = []
    for (const capacityUuid of this.capacities) {
      const item = await fromUuid(capacityUuid)
      if (item) {
        capacities.push(item)
      }
    }
    return capacities
  }

  /**
   * Computes the rank based on the capacities.
   *
   * @returns {Promise<number>} The computed rank.
   */
  async computeRank() {
    const capacities = await this.getCapacities()
    return PathData.computeRank(capacities)
  }
}
