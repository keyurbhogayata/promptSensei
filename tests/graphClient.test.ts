import { GraphClient } from '../src/graphClient';
import * as fs from 'fs';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn()
  }
}));

const TEMP_GRAPH_FILE = 'dummy_path/graph.json';

const testGraphData = {
  nodes: [
    {
      id: "node1",
      label: "User API",
      file_type: "typescript",
      source_file: "src/api/user.ts",
      source_location: "L10"
    },
    {
      id: "node2",
      label: "Database Connection",
      file_type: "typescript",
      source_file: "src/db/connection.ts",
      source_location: "L5"
    },
    {
      id: "node3",
      label: "Auth Middleware",
      file_type: "typescript",
      source_file: "src/middleware/auth.ts",
      source_location: "L20"
    }
  ],
  edges: [
    {
      source: "node1",
      target: "node2",
      relation: "calls"
    },
    {
      source: "node3",
      target: "node1",
      relation: "imports"
    }
  ]
};

describe('GraphClient', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should initialize and load graph data', async () => {
    (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(testGraphData));

    const client = new GraphClient(TEMP_GRAPH_FILE);
    const result = await client.load();
    expect(result).toBe(true);
  });

  it('should return false if graph file does not exist', async () => {
    (fs.promises.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT'));

    const client = new GraphClient('nonexistent.json');
    const result = await client.load();
    expect(result).toBe(false);
  });

  it('should find nodes by label (case insensitive and partial match)', async () => {
    (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(testGraphData));

    const client = new GraphClient(TEMP_GRAPH_FILE);
    await client.load();
    
    const nodes = client.findNodesByLabel('user');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe('node1');
    
    const apiNodes = client.findNodesByLabel('API');
    expect(apiNodes).toHaveLength(1);
    expect(apiNodes[0].id).toBe('node1');
  });

  it('should get neighbors of a node', async () => {
    (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(testGraphData));

    const client = new GraphClient(TEMP_GRAPH_FILE);
    await client.load();
    
    const node1Neighbors = client.getNeighbors('node1');
    // node1 is connected to node2 and node3
    expect(node1Neighbors).toHaveLength(2);
    expect(node1Neighbors.map(n => n.id)).toEqual(expect.arrayContaining(['node2', 'node3']));

    const node2Neighbors = client.getNeighbors('node2');
    expect(node2Neighbors).toHaveLength(1);
    expect(node2Neighbors[0].id).toBe('node1');
  });
});
