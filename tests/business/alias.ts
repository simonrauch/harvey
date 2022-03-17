describe('alias adding', () => {
  it('should add alias if single task is found');
  it('should search alias by search string and add alias');
  it('should ask for single task if multiple tasks were found');
  it('should throw error if no alias was found');
  it('should throw error if more than 10 aliases were found');
});
describe('alias retrieving', () => {
  it('should read existing alias');
  it("should add alias if alias to be read doesn't exist yet");
});
describe('alias removing', () => {
  it('should remove alias');
  it("should throw error if alias to remove doesn't exist");
  it('should remove all aliases');
});
