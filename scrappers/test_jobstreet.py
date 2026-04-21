from playwright.sync_api import sync_playwright

def clean_link(link: str) -> str:
    return link.split("?")[0]

def scrape_jobstreet(page):
    print("\n🔍 Scraping JobStreet...")
    results = []
    seen_links = set()

    # JobStreet migrated to SEEK platform, URLs changed from:
    # https://www.jobstreet.co.id/id/job-search/internship-jobs/ -> https://id.jobstreet.com/id/internship-jobs
    urls = [
        "https://id.jobstreet.com/id/internship-jobs",
        "https://id.jobstreet.com/id/software-engineer-intern-jobs",
        "https://id.jobstreet.com/id/data-intern-jobs",
    ]

    # Kita pakai set keyword matching (kalau ada "intern" di url)
    INTERN_URLS = {u for u in urls if "intern" in u}

    for url in urls:
        is_intern_url = url in INTERN_URLS
        try:
            page.goto(url, timeout=60000, wait_until="domcontentloaded")
            page.wait_for_timeout(5000)

            # Tutup modal login kalau muncul
            try:
                close_btn = page.query_selector("button[aria-label='Close']")
                if close_btn:
                    close_btn.click()
                    page.wait_for_timeout(800)
            except Exception:
                pass

            # Scroll supaya lebih banyak job yang load
            for _ in range(4):
                page.mouse.wheel(0, 5000)
                page.wait_for_timeout(1200)

            jobs_els = page.query_selector_all("article")
            print(f"  [{url}] → {len(jobs_els)} elemen")

            for el in jobs_els:
                try:
                    title_el = el.query_selector("a[data-automation='jobTitle']")
                    if not title_el:
                        title_el = el.query_selector("h3 a[id^='job-title-']")
                    if not title_el:
                        title_el = el.query_selector("h3 a")
                        
                    if not title_el:
                        continue

                    title = title_el.inner_text().strip()
                    link = title_el.get_attribute("href") or ""
                    
                    if link and not link.startswith("http"):
                        # SEEK Platform di Indonesia pakai id.jobstreet.com
                        link = "https://id.jobstreet.com" + link

                    if not title or not link:
                        continue

                    if not is_intern_url:
                        if not any(k in title.lower() for k in ["intern", "magang", "internship"]):
                            continue

                    clean = clean_link(link)
                    if clean in seen_links:
                        continue
                    seen_links.add(clean)

                    loc_el = el.query_selector("[data-automation='jobLocation']")
                    location = loc_el.inner_text().strip() if loc_el else ""

                    company_el = el.query_selector("[data-automation='jobCompany']")
                    company = company_el.inner_text().strip() if company_el else ""

                    results.append({
                        "title": title,
                        "company": company,
                        "link": clean,
                        "location": location,
                        "source": "JobStreet",
                    })

                except Exception:
                    continue

        except Exception as e:
            print(f"[WARN] {url} error → {e}")

    print(f"\n✅ Total jobs: {len(results)}")

    for job in results[:10]:
        print(f"\n- {job['title']} @ {job['company']}")
        print(f"  📍 {job['location']}")
        print(f"  🔗 {job['link']}")

    return results

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        scrape_jobstreet(page)

        browser.close()

if __name__ == "__main__":
    main()
