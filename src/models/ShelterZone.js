export default class ShelterZone {
  constructor(x, y, radius) {
    this.x = x
    this.y = y
    this.radius = radius
  }

  contains(prey) {
    const dx = prey.x - this.x
    const dy = prey.y - this.y
    return dx * dx + dy * dy <= this.radius * this.radius
  }
}
