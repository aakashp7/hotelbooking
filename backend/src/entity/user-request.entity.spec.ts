import {  UserRequest } from './user-request.entity';

describe('UserRequestEntity', () => {
  it('should be defined', () => {
    expect(new UserRequest()).toBeDefined();
  });
});
