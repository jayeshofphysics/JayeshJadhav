# Jayesh Jadhav — Portfolio

A dark, editorial research portfolio designed for GitHub Pages. The website combines a minimal photography-portfolio aesthetic with an academic structure suited to physics, photonics and nanofabrication applications.

## Pages

- `index.html` — About, education, coursework and academic highlights
- `research.html` — CV, thesis, research experience, projects, skills and awards
- `hobbies.html` — Photography gallery, fine art, swimming and trekking
- `contact.html` — Email, LinkedIn, GitHub and phone
- `404.html` — Custom error page
- `style.css` — Responsive visual system
- `app.js` — Mobile navigation, reveal effects and gallery controls

## Add your photographs

The initial design uses lightweight CSS-generated placeholders, so the website works without image files.

To add a photograph to the hobbies gallery:

1. Create an `assets/photos` folder.
2. Add files such as `photo-01.jpg`.
3. In `hobbies.html`, replace a placeholder such as:

```html
<div class="photo-art p1" data-label="Replace with your photograph 01"></div>
```

with:

```html
<img src="assets/photos/photo-01.jpg" alt="A concise description of the photograph">
```

For the About-page portrait, replace the `portrait-art` placeholder in `index.html` with an `<img>` element in the same way.

## CV and thesis downloads

The Research page expects these files:

- `assets/Jayesh_Jadhav_CV.pdf`
- `assets/Jayesh_Jadhav_MSc_Thesis.pdf`

Keep these exact names so the existing download buttons continue to work.

## Publish with GitHub Pages

1. Merge the redesign branch into `main`.
2. Open **Repository Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose `main` and `/ (root)`.
5. Save and wait for GitHub Pages to publish the site.

## Recommended final checks

- Replace the CSS portrait and gallery placeholders with your own photographs.
- Confirm all research dates and wording.
- Add the current CV and final thesis PDFs.
- Check the mobile layout after adding photographs.
