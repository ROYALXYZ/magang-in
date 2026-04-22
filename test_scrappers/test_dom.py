from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    url = "https://id.jobstreet.com/id/internship-jobs"
    page.goto(url, timeout=60000, wait_until="domcontentloaded")
    page.wait_for_timeout(5000)
    article = page.query_selector("article")
    if article:
        html = article.inner_html()
        print(html.replace("><", ">\n<"))
    else:
        print("No article found")
    browser.close()
