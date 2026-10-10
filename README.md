# Nikhil Reddy's portfolio — nkreddy15.com

Black background, fluid animations, project links, research papers and certificate, résumé, and activities. This package is prepared for GitHub Pages. The domain becomes live after the GitHub Pages and Porkbun settings below are completed.

## 1. Create the repository

Open https://github.com/new while signed in as Nkreddy15.

- Repository name: `Nkreddy15.github.io`
- Visibility: Public
- Enable Add a README, then create the repository.

Public repositories can use GitHub Pages on GitHub Free. The domain remains a separate annual purchase.

## 2. Upload the website

Extract this ZIP. In the repository, choose Add file → Upload files. Upload the extracted files and the `assets` and `scripts` folders, then commit to `main`.

`index.html` must be at the repository root, beside `styles.css`, `app.js`, `site-data.js`, and `CNAME`. Keep `assets/Nikhil-Reddy-Resume.pdf` with the other assets. Upload the extracted contents rather than the ZIP itself or an enclosing folder.

The `.nojekyll` file is included for static publishing. If your computer hides it, the ordinary HTML, CSS, JavaScript, and asset paths still work with GitHub's default branch publishing.

## 3. Enable GitHub Pages and set the domain

Open https://github.com/Nkreddy15/Nkreddy15.github.io/settings/pages.

1. Source: Deploy from a branch.
2. Branch: `main`; folder: `/(root)`; click Save.
3. Custom domain: `nkreddy15.com`; click Save.

Complete this before changing Porkbun DNS. The included `CNAME` file contains the domain, but repository settings still need to be configured.

## 4. Connect Porkbun DNS

In Porkbun, open Domain Management → `nkreddy15.com` → DNS.

1. Find Quick DNS Config and click Github.
2. Accept the DNS reconfiguration for this domain.
3. For the additional CNAME record, use Host `www` and Answer `nkreddy15.github.io`.
4. Click Submit.

The GitHub preset configures the root domain. Its IPv4 records and the www record should point here:

| Type | DNS name | Answer |
| --- | --- | --- |
| A | nkreddy15.com | 185.199.108.153 |
| A | nkreddy15.com | 185.199.109.153 |
| A | nkreddy15.com | 185.199.110.153 |
| A | nkreddy15.com | 185.199.111.153 |
| CNAME | www.nkreddy15.com | nkreddy15.github.io |

The preset can also add GitHub's IPv6 records. Keep them if they point to GitHub Pages. Replace conflicting parking records for the root and www rather than keeping both targets. Preserve any unrelated email records.

## 5. Enable HTTPS

Return to GitHub Settings → Pages. Once DNS passes and a certificate is available, enable Enforce HTTPS.

DNS updates and certificate availability can take up to 24 hours. Open https://nkreddy15.com after setup; https://www.nkreddy15.com should redirect to the same portfolio.

## Make later changes

Edit `index.html` for page content, `styles.css` for appearance, and `site-data.js` for project details. Committing changes to `main` republishes the site. The domain does not need to be purchased again when you change the website.

There are no build dependencies, server variables, or monthly hosting requirements for this static GitHub Pages setup. The domain must still be renewed with Porkbun.

Run `npm run check` with Node.js to check existing links, required assets, the black theme, and application state transitions. Browser rendering is a separate manual check.

## Official setup references

Checked 10 October 2026:

- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://kb.porkbun.com/article/64-how-to-connect-your-domain-to-github-pages
