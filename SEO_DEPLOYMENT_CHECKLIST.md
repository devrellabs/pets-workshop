# SEO Deployment Checklist - Tailspin Shelter

## Pre-Deployment Configuration

### 1. Update Production URLs
Before deploying, update the site URL in these files:

- [ ] **client/src/layouts/Layout.astro** (line ~25)
  ```typescript
  const siteUrl = Astro.site || "https://YOUR-PRODUCTION-DOMAIN.com";
  ```

- [ ] **client/src/pages/sitemap.xml.ts** (line 4)
  ```typescript
  const baseUrl = 'https://YOUR-PRODUCTION-DOMAIN.com';
  ```

- [ ] **client/public/robots.txt** (line 5)
  ```
  Sitemap: https://YOUR-PRODUCTION-DOMAIN.com/sitemap.xml
  ```

### 2. Verify Build
- [ ] Run `npm run build` successfully
- [ ] No TypeScript errors
- [ ] No build warnings
- [ ] All pages compile correctly

### 3. Test Locally
- [ ] Homepage loads correctly
- [ ] About page loads correctly
- [ ] Dog detail pages load correctly
- [ ] Navigation works
- [ ] Meta tags appear in page source (View Source)
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`

## Post-Deployment Testing

### 1. Technical SEO Validation

#### Meta Tags & Structured Data
- [ ] Test with [Google Rich Results Test](https://search.google.com/test/rich-results)
  - Enter homepage URL
  - Verify Organization schema appears
  - Verify LocalBusiness schema appears
  - Enter a dog detail page URL
  - Verify Animal schema appears
  - Verify Breadcrumb schema appears

#### Social Media Sharing
- [ ] Test with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
  - Enter homepage URL
  - Verify Open Graph title appears
  - Verify Open Graph description appears
  - Verify Open Graph image appears
  - Scrape several pages

- [ ] Test with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
  - Enter homepage URL
  - Verify card preview appears correctly
  - Test other pages

#### Mobile & Performance
- [ ] Test with [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
  - Enter homepage URL
  - Verify "Page is mobile-friendly"

- [ ] Test with [PageSpeed Insights](https://pagespeed.web.dev/)
  - Test homepage
  - Test about page
  - Test a dog detail page
  - Verify scores:
    - Performance: 75+ (target)
    - Accessibility: 90+ (target)
    - Best Practices: 90+ (target)
    - SEO: 90+ (target)

#### Lighthouse Audit
- [ ] Run Lighthouse in Chrome DevTools
  - Open DevTools (F12)
  - Go to Lighthouse tab
  - Select "Navigation" mode
  - Check all categories
  - Run audit
  - Target scores: 90+ for SEO and Accessibility

### 2. Sitemap & Robots Validation

- [ ] Access `/sitemap.xml` directly in browser
  - Verify XML structure is valid
  - Verify all pages are listed
  - Verify dog pages are included

- [ ] Access `/robots.txt` directly in browser
  - Verify content is correct
  - Verify sitemap URL is correct

- [ ] Validate sitemap XML syntax
  - Use [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)

### 3. Search Console Setup

- [ ] Add site to [Google Search Console](https://search.google.com/search-console)
- [ ] Verify ownership
- [ ] Submit sitemap (`https://YOUR-DOMAIN.com/sitemap.xml`)
- [ ] Request indexing for key pages:
  - Homepage
  - About page
  - A few dog detail pages

### 4. Accessibility Testing

- [ ] Test with screen reader (NVDA, JAWS, or VoiceOver)
  - Navigate header menu
  - Navigate dog list
  - Navigate dog detail page
  - Verify ARIA labels are announced

- [ ] Test keyboard navigation
  - Tab through all interactive elements
  - Verify focus indicators are visible
  - Verify no keyboard traps
  - Test menu toggle with Enter/Space

- [ ] Test with [WAVE Accessibility Tool](https://wave.webaim.org/)
  - Enter homepage URL
  - Check for errors (target: 0 errors)
  - Review alerts and warnings

### 5. Cross-Browser Testing

Test on major browsers:
- [ ] Chrome (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Edge (desktop)

Verify:
- [ ] Meta tags render correctly
- [ ] Structured data works
- [ ] Navigation functions properly
- [ ] Pages load correctly

## Monitoring Setup

### 1. Google Analytics
- [ ] Set up Google Analytics 4
- [ ] Add tracking code to Layout.astro (if desired)
- [ ] Create custom events:
  - Dog detail page views
  - Navigation clicks
  - External link clicks

### 2. Search Console Monitoring
- [ ] Monitor Coverage report
- [ ] Monitor Performance report
- [ ] Monitor Enhancements > Structured data
- [ ] Set up email alerts for issues

### 3. Regular Maintenance Schedule

#### Weekly
- [ ] Check Search Console for errors
- [ ] Monitor organic traffic trends
- [ ] Check for crawl errors

#### Monthly
- [ ] Review keyword rankings
- [ ] Check for broken links
- [ ] Verify sitemap accuracy
- [ ] Review Core Web Vitals

#### Quarterly
- [ ] Update meta descriptions if needed
- [ ] Review and optimize content
- [ ] Check structured data validity
- [ ] Audit competitor SEO

## Troubleshooting

### Meta Tags Not Showing
- Verify page source (View Source in browser)
- Check that Layout.astro props are passed correctly
- Clear browser cache

### Structured Data Errors
- Use Rich Results Test to identify specific errors
- Verify JSON-LD syntax
- Check that all required properties are present

### Sitemap Not Updating
- Check that dog API endpoint is working
- Verify fetch is successful in sitemap.xml.ts
- Clear any CDN or proxy caches

### Low SEO Score
- Run Lighthouse audit for specific issues
- Check that meta tags are present
- Verify structured data validity
- Ensure heading hierarchy is correct

## Success Metrics Baseline

After 30 days, document baseline metrics:

| Metric | Current Value | Goal |
|--------|---------------|------|
| Organic Sessions | _________ | +50% in 6 months |
| Avg. Search Position | _________ | Top 10 for primary keywords |
| Click-Through Rate | _________ | 3%+ |
| Indexed Pages | _________ | All pages indexed |
| Core Web Vitals | _________ | All "Good" |
| Structured Data Items | _________ | No errors |

## Launch Sign-Off

- [ ] All pre-deployment configurations completed
- [ ] All post-deployment tests passed
- [ ] Search Console configured and sitemap submitted
- [ ] Monitoring tools set up
- [ ] Team trained on maintenance procedures
- [ ] Documentation reviewed and approved

**Deployed By:** ___________________  
**Date:** ___________________  
**Production URL:** ___________________  
**Search Console URL:** ___________________

---

## Quick Reference URLs

- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **WAVE Accessibility**: https://wave.webaim.org/
- **Google Search Console**: https://search.google.com/search-console
- **Schema.org Documentation**: https://schema.org/
