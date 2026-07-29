# Jayesh Jadhav – Research Portfolio

A responsive research portfolio designed for GitHub Pages. The visual direction follows the supplied reference: warm cream background, strong cobalt typography, an asymmetric portrait frame and generous editorial spacing.

## Files

- `index.html` – main website
- `assets/css/style.css` – visual design and responsive layout
- `assets/js/script.js` – mobile menu, scroll highlighting and reveal animation
- `assets/profile-placeholder.svg` – temporary portrait placeholder

## Add your portrait

1. Add your photograph inside the `assets` folder.
2. Name it `profile.jpg`.
3. In `index.html`, replace:

```html
<img src="assets/profile-placeholder.svg" alt="Portrait placeholder for Jayesh Jadhav">
```

with:

```html
<img src="assets/profile.jpg" alt="Jayesh Janardan Jadhav">
```

A vertical or square image works best.

## Add your CV

Place your PDF at `assets/Jayesh_Jadhav_CV.pdf`, then add this button inside the hero actions in `index.html`:

```html
<a class="button button-secondary" href="assets/Jayesh_Jadhav_CV.pdf" target="_blank">Download CV</a>
```

## Publish with GitHub Pages

1. Create a new public GitHub repository, for example `jayesh-portfolio`.
2. Upload all files and folders from this package.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. GitHub will show your live website URL after deployment.

## Recommended edits before publishing

- Check all dates and research wording.
- Add your final CV PDF.
- Replace the placeholder portrait.
- Add thesis figures or publication links when available.
- Change the GitHub URL in the contact section if needed.
