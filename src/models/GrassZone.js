export default class GrassZone {
  constructor(x, y, radius, maxFood) {
    this.x = x
    this.y = y
    this.radius = radius
    this.maxFood = maxFood
    this.food = maxFood
    this.foodItems = [] // ← новые объекты еды
  }

  regenerate() {
    // старое восстановление общего количества еды
    if (this.food < this.maxFood) {
      this.food += 0.02
    }
    // новая часть: иногда добавляем еду в виде объектов
    if (this.foodItems.length < this.maxFood / 2) {
      this.spawnFoodItem()
    }
  }

  spawnFoodItem() {
    // создаём объект еды внутри радиуса
    const angle = Math.random() * Math.PI * 2
    const distance = Math.sqrt(Math.random()) * this.radius
    const fx = this.x + Math.cos(angle) * distance
    const fy = this.y + Math.sin(angle) * distance
    this.foodItems.push({ x: fx, y: fy, isEaten: false })
  }
}
