# Maintaining the website

This site is meant to be edited by one person, without deep technical
knowledge, for years. Most updates are just adding a Markdown file. You do not
need to understand the code to keep the site alive.

## Golden rules

1. **Never invent facts.** No dates, names, numbers, photographs, or activity
   that did not actually happen. An empty section is honest; a filled-in fake
   one is not.
2. **Keep pages short.** A visitor should understand a page in under 30 seconds.
3. **Do not make the institution look larger than it is.**
4. **Once a page or update is published, its web address (URL) is permanent.**
   Do not rename a published update file — that breaks its link.

## Add an update (the most common task)

Updates are what make the site feel alive over time.

1. Create a new file in `src/content/updates/`, named in lowercase with hyphens,
   e.g. `child-completed-school-year.md`. This filename becomes the URL, so
   choose it once and keep it.
2. Put this at the top (the "frontmatter"):

   ```yaml
   ---
   title: A short, factual title
   date: 2026-03-14
   summary: One plain sentence, 160 characters or fewer.
   status: published
   ---
   ```

3. Write the update below the second `---`, in plain Markdown.
4. To attach a document, add `document: /documents/your-file.pdf` and place the
   PDF in `public/documents/`.
5. Set `status: draft` while writing; change to `published` when ready. Drafts
   do not appear on the live site.

## Add a governing document

1. Place the web-ready, public-cleared PDF in `public/documents/` with a stable
   lowercase-hyphen name.
2. Open `src/data/governance.ts`, find the matching entry, set `pending: false`,
   and fill in the `date` and `sizeLabel`.

## Images

- Only add **web-ready** images: at most 2000px on the long edge, compressed.
  Keep the original high-resolution files somewhere else (not in this project).
- Every image needs **alt text** — a short description of what it shows.
- Do not caption a child or family member with identifying details.

## Before anything goes live

Run these once:

```bash
npm run check   # catches broken content and type errors
npm run build   # must finish with no errors
```

Then re-read the page as a stranger would. If a sentence does not earn its
place, delete it.
