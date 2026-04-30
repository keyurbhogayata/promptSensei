---
name: cluster-4
description: "Skill for the Cluster_4 area of promptSensei. 3 symbols across 1 files."
---

# Cluster_4

3 symbols | 1 files | Cohesion: 80%

## When to Use

- Working with code in `src/`
- Understanding how calculateWaste work
- Modifying cluster_4-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/calculator.ts` | countTokens, codeFoundInFinalTree, calculateWaste |

## Entry Points

Start here when exploring this area:

- **`calculateWaste`** (Function) — `src/calculator.ts:68`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `calculateWaste` | Function | `src/calculator.ts` | 68 |
| `countTokens` | Function | `src/calculator.ts` | 32 |
| `codeFoundInFinalTree` | Function | `src/calculator.ts` | 47 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Activate → CountTokens` | cross_community | 3 |
| `Activate → CodeFoundInFinalTree` | cross_community | 3 |

## How to Explore

1. `gitnexus_context({name: "calculateWaste"})` — see callers and callees
2. `gitnexus_query({query: "cluster_4"})` — find related execution flows
3. Read key files listed above for implementation details
