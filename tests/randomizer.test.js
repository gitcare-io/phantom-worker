const Randomizer = require('./../src/Randomizer');

describe('Randomizer', () => {
  test('can be initialized', () => {
    const randomizer = new Randomizer();
    expect(randomizer).toBeInstanceOf(Randomizer);
  });

  test('#getProbabilityResult should return boolean', () => {
    const randomizer = new Randomizer();
    expect(typeof randomizer.getProbabilityResult() === 'boolean').toBeTruthy();
  });

  test('#getProbabilityResult should return boolean', () => {
    const randomizer = new Randomizer();
    expect(typeof randomizer.getProbabilityResult() === 'boolean').toBeTruthy();
  });

  test('#getProbabilityResult should return true if probability 100', () => {
    const randomizer = new Randomizer();
    expect(randomizer.getProbabilityResult(100)).toBeTruthy();
  });

  test('#getProbabilityResult should return false if probability 0', () => {
    const randomizer = new Randomizer();
    expect(randomizer.getProbabilityResult(0)).toBeFalsy();
  });
})