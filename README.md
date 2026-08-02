# Jayesh Jadhav — Portfolio

A dark, editorial research portfolio for GitHub Pages, combining a minimal photography-portfolio aesthetic with an academic structure suited to physics, photonics, spectroscopy and nanofabrication applications.

## Pages

- `index.html` — About, education, coursework and academic highlights
- `research.html` — CV, thesis, research experience, projects, skills, conferences and workshops
- `thesis-report.html` — Dedicated M.Sc. thesis overview based on the original project report
- `barc-report.html` — Dedicated BARC high-pressure Raman and INDUS-II overview
- `hobbies.html` — Photography gallery, fine art, swimming and trekking
- `contact.html` — Email, LinkedIn, GitHub and phone
- `404.html` — Custom error page
- `style.css` — Core responsive visual system
- `enhancements.css` — Optional interactive transitions and research schematics
- `app.js` — Navigation, gallery controls, reveal effects and the motion toggle

## Official document assets

All website view/download links use the original files supplied in the capitalized `Assets` folder:

- `Assets/RESUME.pdf` — CV/resume
- `Assets/ThesisReport.pdf` — complete M.Sc. project report
- `Assets/Jayesh BARC Report_merged.pdf` — BARC summer project report

Do not replace website links with generated résumé or thesis-summary PDFs.

## Add your photographs

The hobbies gallery currently uses lightweight CSS-generated placeholders, so the website works without image files.

To add a photograph:

1. Create an `Assets/photos` folder.
2. Add files such as `photo-01.jpg`.
3. Replace a gallery placeholder in `hobbies.html` with an image, for example:

```html
<img src="Assets/photos/photo-01.jpg" alt="A concise description of the photograph">
```

For the About-page portrait, replace `profile-placeholder.svg` with your preferred portrait while keeping the same filename, or update the image path in `index.html`.

## Motion and interaction

The website includes restrained hover, reveal and pointer effects. A fixed **Motion: on/off** control lets visitors immediately return to the simpler static presentation. The choice is saved in the browser and the site also respects `prefers-reduced-motion`.

## Publish with GitHub Pages

1. Open **Repository Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose `main` and `/ (root)`.
4. Save and wait for GitHub Pages to publish the latest commit.

## Recommended checks

- Replace the photography placeholders with original photographs.
- Test the page on desktop and mobile after GitHub Pages redeploys.
- Use a hard refresh if the browser still shows an older cached design.
