# Blinkered dictionary: Croatian

The Croatian word list, and the evidence for every word in it.

Built by [`blinkered-attestation`](https://github.com/blinkered/blinkered-attestation). The rule,
the evidence format and the reasoning live there; what lives here is Croatian.

**219,247 of 341,040 candidates proved: 64.3%**, across 17 independent families, 15 of which a
stranger could check by fetching.

## What is in this repository

```
sources.mjs        which collections attest Croatian, and why those
attestations/      the evidence: every candidate, what saw it, and where
searched.tsv       pages fetched from Croatian publishers, as word counts only
words.txt          what survived, in Blinkered's own format
dropped.tsv        what did not, and how close it came
SATURATION.md      what each family was worth, measured from the evidence
COLLECTIONS.md     every collection read, and where to get it again
status.json        the numbers, whether this ships, and what the list is under
```

`.cache/` holds the downloaded collections and is not tracked. Everything here is regenerable
with `pnpm build`.

## Where the words come from

Candidates come from Blinkered's Croatian list, which lives in
[`blinkered-attestation/candidates/hr`](https://github.com/blinkered/blinkered-attestation/tree/main/candidates/hr).
The dictionaries that built it are demoted to **proposing words worth looking up**. What earns a
word its place here is evidence that it occurs in the world: three independent collections, each
recorded with a locator somebody else can fetch.

Croatian, Serbian and Bosnian overlap heavily, and a Serbian word written in Latin is spelled
exactly as a Croatian candidate would be. So every collection here is one that says it is
Croatian: the Croatian Wikipedia rather than the Serbo-Croatian one, Leipzig's `hrv` packages,
FineWeb-2's `hrv_Latn`, Internet Archive books filed as Croatian, and publishers based in Croatia.
Project Gutenberg has no Croatian texts, so there is no Gutenberg family.

The candidate list is fifteen times the size of Czech's and most of the excess is inflection. The
words one family short are overwhelmingly forms seen by FineWeb-2 and one other collection, and
books were the family that reached them: a thousand-odd Internet Archive books took the list from
50% to 64%. `SATURATION.md` says what each family was worth. `COLLECTIONS.md` names every
collection read and where to get it again, which is what makes the downloads disposable.

## Rebuilding

```
pnpm install
pnpm build        # reads whatever collections are in .cache/raw, reuses the record for the rest
pnpm conform      # the list says only what the evidence supports
pnpm saturation   # recomputes the curve and status.json
```

A collection that is not on disk is skipped with a warning and its recorded testimony is reused,
so a rebuild after more books arrive is short rather than a re-read of everything.

## Before this ships

`COMMON_CUT` in `sources.mjs` is carried over from Blinkered's old calibration against a
differently sized list. It has to be re-measured before this list reaches the game, and
`status.json` says `ships: "pending"` until somebody decides otherwise.

## Licensing

Three kinds of thing live here and they do not share terms. The distinction is the project: a
licence that claimed more than we can support would undo the argument the evidence is here to
make. [NOTICE](NOTICE) is the authority; this is the summary.

| | terms | what |
| --- | --- | --- |
| **Code and docs** | [Apache-2.0](LICENSE) | `build.mjs`, `sources.mjs`, `harvest.mjs`, `conform.mjs`, `saturation.mjs`, and the Markdown |
| **The list and its evidence** | [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `words.txt`, the evidence, `status.json`, `SATURATION.md`, `COLLECTIONS.md`, `searched.tsv` |
| **The words we could not prove** | `SISSL` | `dropped.tsv`: **not ours to license** |

**Why the list is CC0.** A word ships because three independent collections of text were found to
contain it. The record of which collections, and where in them, is a statement of fact about those
texts rather than a copy of them, and nothing a licence governs was taken from the dictionary that
proposed the candidates.

**Why `dropped.tsv` is not.** It is the candidates that failed, and a candidate that failed is a
word we have nothing to say about except that somebody's dictionary proposed it. That makes the
file a subset of that dictionary and it carries that dictionary's terms; here `SISSL`.
