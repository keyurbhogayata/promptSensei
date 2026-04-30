---
name: cluster-3
description: "Skill for the Cluster_3 area of promptSensei. 3 symbols across 1 files."
---

# Cluster_3

3 symbols | 1 files | Cohesion: 80%

## When to Use

- Working with code in `src/`
- Understanding how readGitWorkingTree work
- Modifying cluster_3-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/git-reader.ts` | isReadable, isGitRepo, readGitWorkingTree |

## Entry Points

Start here when exploring this area:

- **`readGitWorkingTree`** (Function) — `src/git-reader.ts:41`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `readGitWorkingTree` | Function | `src/git-reader.ts` | 41 |
| `isReadable` | Function | `src/git-reader.ts` | 14 |
| `isGitRepo` | Function | `src/git-reader.ts` | 22 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Activate → IsGitRepo` | cross_community | 3 |
| `Activate → IsReadable` | cross_community | 3 |

## How to Explore

1. `gitnexus_context({name: "readGitWorkingTree"})` — see callers and callees
2. `gitnexus_query({query: "cluster_3"})` — find related execution flows
3. Read key files listed above for implementation details
