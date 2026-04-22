from playwright.sync_api import sync_playwright

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://id.jobstreet.com/id/internship-jobs", timeout=60000, wait_until="domcontentloaded")
        page.wait_for_timeout(5000)
        jobs_els = page.query_selector_all("article")
        print(f"Found {len(jobs_els)} articles")
        
        for el in jobs_els[:2]:
            print("---")
            title_el = el.query_selector("a[data-automation='jobTitle']")
            if title_el:
                print("Title:", title_el.inner_text())
                print("Link:", title_el.get_attribute("href"))
            else:
                print("No title_el found using data-automation!")
                title_el2 = el.query_selector("h3 a[id^='job-title-']")
                if title_el2:
                    print("Found with h3 a:", title_el2.inner_text())
                else:
                    print("Still no title")
            
            loc_el = el.query_selector("[data-automation='jobLocation']")
            print("Loc:", loc_el.inner_text() if loc_el else "None")
            
            company_el = el.query_selector("[data-automation='jobCompany']")
            print("Company:", company_el.inner_text() if company_el else "None")

        browser.close()

test()
