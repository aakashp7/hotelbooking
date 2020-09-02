import { City } from './city.entity';

describe('City', () => {
  it('should be defined', () => {
    expect(new City()).toBeDefined();
  });
});
