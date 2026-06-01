Place real photography and video assets in folders based on where they are used.

## Hero Carousel

Add hero images and videos here:

```text
public/media/hero/
```

Supported hero files:

- Images: `.avif`, `.gif`, `.jpg`, `.jpeg`, `.png`, `.webp`
- Videos: `.mp4`, `.mov`, `.webm`

Files in `public/media/hero/` are added to the hero carousel automatically during local development and when Cloudflare Pages builds the site.

Use filename prefixes to control order:

```text
public/media/hero/01-wedding-ceremony.webp
public/media/hero/02-family-session.webp
public/media/hero/03-showreel.mp4
public/media/hero/03-showreel-poster.webp
```

Poster images named `video-name-poster.webp` are used as the poster for a matching video and are not shown as separate slides.

## Other Media

Useful folders:

```text
public/media/portfolio/
public/media/video/
```

## Portfolio Gallery

Add portfolio images and videos here:

```text
public/media/portfolio/
```

The portfolio section scans this folder automatically during local development and at build time.

Start filenames with the filter tag you want to show before the first `-`:

```text
wedding-james.webp
pets-black-lab.webp
family-smith-session.webp
commercial-brand-film.mp4
```

Those prefixes become the portfolio filters automatically. For example,
`cow-green.jpg`, `sheep-sky.webm`, and `pig-fun.webp` create `cow`, `sheep`,
and `pig` filters.

Supported portfolio files:

- Images: `.avif`, `.gif`, `.jpg`, `.jpeg`, `.png`, `.webp`
- Videos: `.mp4`, `.mov`, `.webm`

For video posters, use the matching `-poster` filename:

```text
commercial-brand-film.mp4
commercial-brand-film-poster.webp
```

Poster images are not shown as separate gallery items.

Reference files from React or CSS with root paths such as `/media/portfolio/wedding-1.webp`.

## Client Galleries

Create one folder per client gallery here:

```text
public/media/client_galleries/
```

Use the client gallery code as the folder name:

```text
public/media/client_galleries/07964907393/
```

Images inside that folder are shown when the client opens `Get my photos` and
enters the matching code with spaces removed.

```text
public/media/client_galleries/07964907393/001.webp
public/media/client_galleries/07964907393/002.webp
public/media/client_galleries/07964907393/003.webp
```

Supported client gallery files:

- Images: `.avif`, `.gif`, `.jpg`, `.jpeg`, `.png`, `.webp`

Put low-resolution, watermarked proof images in this public folder and keep
full-resolution originals outside the public website files.
