import { OptimizerEngine } from '../src/optimizer';
import { GraphClient, GraphNode } from '../src/graphClient';

jest.mock('../src/graphClient');

describe('OptimizerEngine', () => {
  let mockGraphClient: jest.Mocked<GraphClient>;
  let engine: OptimizerEngine;

  beforeEach(() => {
    mockGraphClient = new GraphClient('fake/path') as jest.Mocked<GraphClient>;
    mockGraphClient.load = jest.fn().mockResolvedValue(true);
    mockGraphClient.findNodesByLabel = jest.fn();
    mockGraphClient.getNeighbors = jest.fn();

    engine = new OptimizerEngine(mockGraphClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should load graph client only once when optimize is called multiple times', async () => {
    mockGraphClient.findNodesByLabel.mockReturnValue([]);
    
    await engine.optimize('hello');
    await engine.optimize('world');

    expect(mockGraphClient.load).toHaveBeenCalledTimes(1);
  });

  it('should skip words with less than 3 characters', async () => {
    mockGraphClient.findNodesByLabel.mockReturnValue([]);

    await engine.optimize('is it ok');

    expect(mockGraphClient.findNodesByLabel).not.toHaveBeenCalled();
  });

  it('should return source files from seeds and their neighbors', async () => {
    const seedNode: GraphNode = {
      id: 'node1',
      label: 'testWord',
      file_type: 'ts',
      source_file: 'src/test1.ts',
      source_location: '1:1',
    };

    const neighborNode: GraphNode = {
      id: 'node2',
      label: 'neighbor',
      file_type: 'ts',
      source_file: 'src/test2.ts',
      source_location: '2:1',
    };

    mockGraphClient.findNodesByLabel.mockImplementation((label) => {
      if (label === 'testWord') {
        return [seedNode];
      }
      return [];
    });

    mockGraphClient.getNeighbors.mockImplementation((id) => {
      if (id === 'node1') {
        return [neighborNode];
      }
      return [];
    });

    const result = await engine.optimize('testWord');

    expect(result).toEqual(expect.arrayContaining(['src/test1.ts', 'src/test2.ts']));
    expect(result.length).toBe(2);
  });
});
