# Order Tracker QA

A small order-management web app (HTML, CSS, vanilla JavaScript) used as a hands-on QA project. The focus of this repo is the testing: test planning, manual test cases, bug reports and Playwright automation.

## The app
- Login (demo users: `admin` / `password123`, `manager` / `password123`)
- Dashboard with order counts by status
- Add order form with validation
- Search by order ID, customer or item, plus status filters
- Cancel button for Pending orders only
- Orders saved in localStorage; reset to demo data

## Repo structure
| Path | Contents |
|---|---|
| `app/` | The Order Tracker app (`index.html`, `style.css`, `app.js`) |
| `docs/test-plan.md` | Scope, risks, test types, entry/exit criteria |
| `docs/test-cases.md` | Manual test cases |
| `docs/bug-reports/` | Bug reports found during testing |
| `tests/` | Playwright automated tests |

## Run the app
```bash
cd app
npx serve
```
Or open `app/index.html` in a browser.

## QA status
- [ ] Test plan
- [ ] 20+ manual test cases
- [ ] 3-5 bug reports
- [ ] Playwright tests
- [ ] CI with GitHub Actions

## Author
Vinit | [GitHub](https://github.com/vinitp2)
