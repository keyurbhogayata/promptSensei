// src/optimizer.ts
import { GraphClient, GraphNode } from './graphClient';

export class OptimizerEngine {
  private loaded = false;

  constructor(private client: GraphClient) {}

  async optimize(prompt: string): Promise<string[]> {
    if (!this.loaded) {
      const success = await this.client.load();
      if (!success) {
        throw new Error("Failed to load knowledge graph from graphify-out/graph.json. Please run graphify first.");
      }
      this.loaded = true;
    }
    const words = prompt.split(/\W+/);
    const seeds: GraphNode[] = [];
    
    for (const word of words) {
      if (word.length < 3) continue;
      seeds.push(...this.client.findNodesByLabel(word));
    }

    const candidates = new Set<string>();
    for (const seed of seeds) {
      candidates.add(seed.source_file);
      this.client.getNeighbors(seed.id).forEach(n => candidates.add(n.source_file));
    }

    return Array.from(candidates);
  }
}
