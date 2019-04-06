module.exports = class Randomizer {
  constructor() {}

  async getProbabilityResult(percent = 50, func) {
    if (typeof func !== 'function') return;
    const randomNumber = this.getRandomNumberBeetween(0, 100);
    return randomNumber <= percent
  }

  getRandomNumberBeetween(start = 0, end = 100) {
    return Math.floor(Math.random() * end) + start;
  }
}