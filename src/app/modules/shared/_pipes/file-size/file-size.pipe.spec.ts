import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
  let pipe: FileSizePipe;

  beforeEach(() => {
    pipe = new FileSizePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should return "?" string', () => {
      expect(pipe.transform(null)).toEqual(''); // should fails, check and fix
    });

    it('should return 2.34 MB', () => {
      expect(pipe.transform(2.34 * 1024 * 1024).match('2.34 MB.')); // should fails, check and fix
    });

    it('should return 135.00 KB', () => {
      expect(pipe.transform(135 * 1024).match('135.00 KB.')); // should fails, check and fix
    });
  });
});
