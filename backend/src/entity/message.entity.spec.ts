import { Message } from './message.entity';

describe('MessageEntity', () => {
  it('should be defined', () => {
    expect(new Message()).toBeDefined();
  });
});
