import * as fs from 'fs';

export interface GraphNode {
  id: string;
  label: string;
  file_type: string;
  source_file: string;
  source_location: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

export class GraphClient {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];
  private adjacencyList: Map<string, string[]> = new Map();

  constructor(private graphPath: string) {}

  async load(): Promise<boolean> {
    try {
      const data = JSON.parse(await fs.promises.readFile(this.graphPath, 'utf8'));
      this.nodes.clear();
      data.nodes.forEach((n: GraphNode) => this.nodes.set(n.id, n));
      this.edges = data.links || data.edges || [];
      
      this.adjacencyList.clear();
      for (const edge of this.edges) {
        if (!this.adjacencyList.has(edge.source)) this.adjacencyList.set(edge.source, []);
        if (!this.adjacencyList.has(edge.target)) this.adjacencyList.set(edge.target, []);
        this.adjacencyList.get(edge.source)!.push(edge.target);
        this.adjacencyList.get(edge.target)!.push(edge.source);
      }
      return true;
    } catch {
      return false;
    }
  }

  findNodesByLabel(label: string): GraphNode[] {
    return Array.from(this.nodes.values()).filter(n => 
      n.label.toLowerCase().includes(label.toLowerCase())
    );
  }

  getNeighbors(nodeId: string): GraphNode[] {
    const neighborIds = this.adjacencyList.get(nodeId) || [];
    return neighborIds
      .map(id => this.nodes.get(id))
      .filter((n): n is GraphNode => !!n);
  }
}
