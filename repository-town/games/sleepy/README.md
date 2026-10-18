# Sylvie's Sleepy Stories

Sylvie's Sleepy Stories is a static bedtime video shelf built from a parent-curated library of calm story and music links. It is designed to make repeat bedtime favourites easier to find without browsing a recommendation feed.

Repository: https://github.com/joshualparris/Sleepy.git

## Current State

The app is a working static HTML project. It can be opened directly in a browser and does not need a build step.

See:

- [Status](docs/status.md)
- [Roadmap](docs/roadmap.md)
- [Research Implementation Roadmap](docs/ResearchImplementationRoadmap.md)
- [Content and Safety](docs/content-and-safety.md)
- [Data Guide](docs/data-guide.md)

## Feature Summary

- Bedtime shelf with 34 curated videos.
- Search and tag filters.
- Favourite list stored in browser `localStorage`.
- Recent list stored in browser `localStorage`.
- Kid/Sylvie mode toggle for a simpler bedtime view.
- Shuffle button for choosing from the current filtered shelf.
- YouTube thumbnail previews and outbound video links.
- Separate `Recommendation.html` page for adult recommendation experiments.

## Run Locally

Open `index.html` directly in a browser.

For a local server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Project Structure

```text
index.html
library.json
Recommendation.html
bedtimes with sylvie.txt
docs/
```

The deployed app currently embeds the library data inside `index.html`. `library.json` is the clean source of record for reviewing and maintaining the library.

After editing the library, run `node scripts/sync-library.mjs` to regenerate the embedded copy.

## Safety Model

This project intentionally avoids live feed browsing. However, videos still open on YouTube, so all content should be parent-reviewed before bedtime use.
