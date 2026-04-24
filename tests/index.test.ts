// tests/index.test.ts
import { runCoach } from '../src/index';

describe('runCoach', () => {
  it('should return a basic success object when called', () => {
    const result = runCoach();
    expect(result).toEqual({ success: true, message: 'AI Coach initialized' });
  });
});
