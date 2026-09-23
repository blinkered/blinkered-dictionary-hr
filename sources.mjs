/**
 * The collections that attest Croatian, and where each comes from.
 *
 * Croatian has a 341,040-word candidate list, fifteen times Czech's, most of the excess being
 * inflected forms of a seven-case language. Expect the small families to be the ceiling.
 *
 * Croatian, Serbian and Bosnian are close enough that a corpus of one routinely holds the others,
 * and a Serbian word written in Latin is spelled exactly as a Croatian candidate would be. So every
 * collection here is one that says it is Croatian: `hrwiki` rather than the Serbo-Croatian `shwiki`,
 * Leipzig's `hrv` packages rather than `hbs`, `srp` or `bos`, FineWeb-2's `hrv_Latn`, and Archive
 * books filed as Croatian rather than Serbo-Croatian. The Bible is Šarić's, a Croatian translation
 * even though it was first printed in Sarajevo. Project Gutenberg has no Croatian texts at all.
 *
 * Every URL here was probed before it was written down. A collection that 404s does not fail
 * loudly — the build skips it with a warning and reports a healthy number over fewer families.
 */
import { createReadStream, existsSync, readFileSync, readdirSync } from 'node:fs'
import { createInterface } from 'node:readline'
import {
  fileDocuments,
  fineweb2Documents,
  harvestDocuments,
  leipzigLocators,
  leipzigSentences,
  tatoebaDocuments,
  verseDocuments,
  wikiDocuments,
} from '@blinkered/attestation'

export const LANGUAGE = 'hr'

const CACHE = new URL('.cache/raw/', import.meta.url).pathname

/** A Leipzig package, with its sentence-to-URL index resolved up front. */
function leipzig(pkg) {
  const base = `${CACHE}${pkg}/${pkg}`
  const locators = leipzigLocators(
    readFileSync(`${base}-inv_so.txt`, 'utf8'),
    readFileSync(`${base}-sources.txt`, 'utf8'),
  )
  const lines = createInterface({
    input: createReadStream(`${base}-sentences.txt`),
    crlfDelay: Infinity,
  })
  return leipzigSentences(lines, locators)
}

// News only. The Leipzig Wikipedia packages are deliberately absent: they are Wikipedia text
// wearing a Leipzig label, so including one would corroborate `wiki:hr` while looking
// like another family. That is the exact failure the three-families rule exists to catch.
// Leipzig has no Croatian news newer than 2020, so the newscrawl of 2016 is here for volume.
const LEIPZIG = [
  'hrv_news_2020_1M',
  'hrv_news_2019_300K',
  'hrv_newscrawl_2016_1M',
]

const ALL = [
  {
    id: 'wiki:hr',
    what: 'Croatian Wikipedia — modern encyclopedic prose',
    needs: `${CACHE}hrwiki.xml.bz2`,
    documents: () => wikiDocuments(`${CACHE}hrwiki.xml.bz2`),
  },
  {
    id: 'wikisource:hr',
    what: 'Croatian Wikisource — same Wikimedia family, so it corroborates rather than counts',
    needs: `${CACHE}hrwikisource.xml.bz2`,
    documents: () => wikiDocuments(`${CACHE}hrwikisource.xml.bz2`),
  },
  ...LEIPZIG.map((pkg) => ({
    id: `lz:${pkg}`,
    from: `https://downloads.wortschatz-leipzig.de/corpora/${pkg}.tar.gz`,
    what: `Leipzig ${pkg} — modern news, cited by the page each sentence came from`,
    needs: `${CACHE}${pkg}`,
    documents: () => leipzig(pkg),
  })),
  {
    id: 'tat',
    from: 'https://downloads.tatoeba.org/exports/per_language/hrv/hrv_sentences.tsv.bz2',
    what: 'Tatoeba Croatian — contemporary and conversational',
    needs: `${CACHE}hrv_sentences.tsv`,
    documents: () => tatoebaDocuments(`${CACHE}hrv_sentences.tsv`),
  },
  {
    id: 'fw2',
    from: 'https://huggingface.co/datasets/HuggingFaceFW/fineweb-2/resolve/main/data/hrv_Latn/train/000_00000.parquet',
    what: 'FineWeb-2 Croatian — a web crawl nobody here made',
    needs: `${CACHE}fineweb2-hrv.parquet`,
    documents: () => fineweb2Documents(`${CACHE}fineweb2-hrv.parquet`),
  },
  {
    id: 'ebible:hrv',
    from: 'https://ebible.org/Scriptures/hrv_vpl.zip',
    what: "Šarić's Bible of 1942 — a family nothing else here belongs to",
    needs: `${CACHE}ebible-hrv/hrv_vpl.txt`,
    documents: () => verseDocuments(`${CACHE}ebible-hrv/hrv_vpl.txt`),
  },
  {
    id: 'ia',
    // Scanned books are OCR, and OCR fails in a way that looks like text. Clean Gutenberg scores
    // a median 52% known words and never below 36%; the worst of these scored 1%, an English
    // book read as Cyrillic. Below this floor a book is not legible enough to attest anything.
    legible: 0.35,
    what: 'Internet Archive Croatian books — literature, and the register a newspaper never reaches',
    needs: `${CACHE}archive-hr`,
    // Filed as `Croatian` or as `hrv`; the two catalogue values overlap only in part. A third of
    // what the Archive files as Croatian is Russian or Serbian Cyrillic, or pre-reform Croatian
    // too far from the modern spelling to match, and the legibility floor turns those away.
    from: 'https://archive.org/search?query=mediatype%3Atexts+AND+%28language%3A%22Croatian%22+OR+language%3A%22hrv%22%29',
    documents: () => {
      const dir = `${CACHE}archive-hr`
      // A locator names the text, not the item: the catalogue page holds no word of the book.
      const named = new Map(
        readFileSync(`${dir}/files.tsv`, 'utf8')
          .split('\n')
          .filter(Boolean)
          .map((line) => line.split('\t')),
      )
      const books = readdirSync(dir)
        .filter((file) => file.endsWith('.txt'))
        .map((file) => file.replace('.txt', ''))
        .filter((id) => named.has(id))
        // Percent-encoded: two thirds of Archive filenames contain spaces, and the evidence
        // format spends spaces as separators.
        .map((id) => ({
          locator: `${id}/${encodeURIComponent(named.get(id))}`,
          path: `${dir}/${id}.txt`,
        }))
      return fileDocuments(books, async (path) => readFileSync(path, 'utf8'))
    },
  },
]

export const SOURCES = ALL.filter((source) => {
  if (source.needs === undefined || existsSync(source.needs)) return true
  process.stderr.write(`  (skipping ${source.id}: ${source.needs} is not in .cache/raw)\n`)
  return false
})

/**
 * Croatian publishers, for the harvest.
 *
 * Chosen because they publish in Croatian rather than because they are large. A harvester
 * reads whatever it fetches and has no idea what language it is in, so a domain that publishes
 * mostly in another language would attest that language's words against these candidates. That
 * matters more here than for most languages: a Serbian or Bosnian outlet would confirm Croatian
 * candidates with text that is not Croatian, so every domain below is based in Croatia. The
 * literary and cultural group goes first, for a register the dailies never reach.
 */
export const DOMAINS = [
  'matica.hr', 'booksa.hr', 'hrcak.srce.hr',
  'index.hr', 'jutarnji.hr', 'vecernji.hr', 'hrt.hr', 'tportal.hr',
  'slobodnadalmacija.hr', 'novilist.hr', 'glas-slavonije.hr', 'net.hr',
]

export const HARVEST = existsSync(new URL('searched.tsv', import.meta.url).pathname)
  ? () => harvestDocuments(new URL('searched.tsv', import.meta.url).pathname)
  : undefined

/** Carried over from Blinkered's calibration; must be re-measured before anything ships. */
export const COMMON_CUT = 17000
