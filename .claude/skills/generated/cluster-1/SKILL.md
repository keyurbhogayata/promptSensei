---
name: cluster-1
description: "Skill for the Cluster_1 area of promptSensei. 3 symbols across 1 files."
---

# Cluster_1

3 symbols | 1 files | Cohesion: 80%

## When to Use

- Working with code in `src/`
- Understanding how parseLog work
- Modifying cluster_1-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/parser.ts` | parseLog, createTurn, extractSearchReplace |

## Entry Points

Start here when exploring this area:

- **`parseLog`** (Function) — `src/parser.ts:6`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `parseLog` | Function | `src/parser.ts` | 6 |
| `createTurn` | Function | `src/parser.ts` | 41 |
| `extractSearchReplace` | Function | `src/parser.ts` | 75 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Activate → ExtractSearchReplace` | cross_community | 4 |

## How to Explore

1. `gitnexus_context({name: "parseLog"})` — see callers and callees
2. `gitnexus_query({query: "cluster_1"})` — find related execution flows
3. Read key files listed above for implementation details
