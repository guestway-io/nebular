# Nebular [<img src="https://i.imgur.com/oMcxwZ0.png" alt="Eva Design System" height="20px" />](https://eva.design?utm_campaign=eva_design%20-%20home%20-%20nebular%20github%20readme&utm_source=nebular&utm_medium=referral&utm_content=github_readme_hero_pic) [![npm](https://img.shields.io/npm/l/@nebular/theme.svg)]() [![npm](https://img.shields.io/npm/dt/@nebular/theme.svg)](https://www.npmjs.com/package/@nebular/theme) [![Codecov](https://img.shields.io/codecov/c/github/akveo/nebular/master.svg?style=flat-square)](https://codecov.io/gh/akveo/nebular/branch/master)

[Documentation](https://akveo.github.io/nebular/docs/getting-started/what-is-nebular?utm_campaign=nebular%20-%20home%20-%20nebular%20github%20readme&utm_source=nebular&utm_medium=referral&utm_content=documentation) | [Stackblitz Template](https://stackblitz.com/github/akveo/nebular-seed) | [Angular templates](https://www.akveo.com/templates?utm_campaign=services%20-%20github%20-%20templates&utm_source=nebular&utm_medium=referral&utm_content=github%20readme%20top%20angular%20templates%20link)

Nebular is a customizable Angular UI Library with a focus on beautiful design and ability to adapt it to your brand easily. It comes with 4 stunning visual themes, a powerful theming engine with runtime theme switching and support of custom css properties mode. Nebular is based on Eva Design System specifications.

<a href="https://akveo.github.io/nebular/?utm_campaign=nebular%20-%20home%20-%20nebular%20github%20readme&utm_source=nebular&utm_medium=referral&utm_content=nebular_readme_pic"><img src="https://i.imgur.com/vu5Ro3A.jpg"></a>

## What's included

- **4 Visual Themes, including new Dark** easily customizable to your brand
- **35+ Angular UI components** with a bunch of handy settings and configurations
- **Configurable options** - colors, sizes, appearances, shapes, and other useful settings
- **3 Auth strategies and Security** - authentication and security layer easily configurable for your API
- **Powerful theming engine** with custom CSS properties mode
- **SVG Eva Icons support** - 480+ general purpose icons

## Repository state and engagement with the community

Repository is currently in a state of minimal maintenance. Our primary focus is on ensuring that the Angular version used in this project is kept up to date. Our capacity to engage in other aspects of repository management is currently limited.

We are not actively reviewing or merging pull requests, responding to or resolving issues at this time. We appreciate the effort and contributions from the community and we understand that issues are crucial for the community. But now our current focus is solely on maintaining Angular.

## Quick Start

You can install Nebular with Angular CLI:

```bash
ng add @nebular/theme
```

Configuration will be done automatically.

If you want to have more control over setup process you can [use manual setup guide](https://akveo.github.io/nebular/docs/guides/install-nebular?utm_campaign=nebular%20-%20home%20-%20nebular%20github%20readme&utm_source=nebular&utm_medium=referral&utm_content=install_manually#manually).

## Browser Support

Nebular supports most recent browsers. Browser support list can be found <a href="https://angular.io/guide/browser-support" target="_blank">here</a>.

## Starters

- [ngx-admin](http://github.com/akveo/ngx-admin) - 20k+ stars application based on Nebular modules with beautiful E-Commerce & IOT components, for boosting your developing process. [Live Demo](https://www.akveo.com/ngx-admin?utm_campaign=ngx_admin%20-%20demo%20-%20nebular%20github%20readme%20-%20traffic&utm_source=nebular&utm_medium=referral&utm_content=github_readme).
- [ngx-admin-starter](https://github.com/akveo/ngx-admin/tree/starter-kit) - clean application based on Nebular modules with a limited number of additional dependencies.

## UI Bakery

Need a visual admin dashboard builder? Check out [UI Bakery](https://uibakery.io).

<a href="https://uibakery.io"><img src="https://storage.uibakery.io/video-assets/landing/Logo/UIB%20400x150.png" height="80" /></a>

## License

[MIT](LICENSE.txt) license.

## More from Akveo

- [Eva Icons](https://github.com/akveo/eva-icons) - 480+ beautiful Open Source icons
- [Akveo templates](https://www.akveo.com/templates?utm_campaign=services%20-%20github%20-%20templates&utm_source=nebular&utm_medium=referral&utm_content=nebular%20github%20readme%20more%20from%20akveo%20link) - 10+ Ready-to-use apps templates to speed up your apps developments

## How can I support the developers?

- Star our GitHub repo :star:
- Create pull requests, submit bugs, suggest new features or documentation updates :wrench:
- Read us on [Medium](https://medium.com/akveo-engineering)
- Follow us on [Twitter](https://twitter.com/akveo_inc) :feet:
- Like our page on [Facebook](https://www.facebook.com/akveo/) :thumbsup:

## From Developers

Made with :heart: by [Akveo team](https://www.akveo.com?utm_campaign=service%20-%20akveo%20website%20-%20nebular%20github%20readme%20-%20traffic&utm_source=nebular&utm_medium=referral&utm_content=github_readme). Follow us on [Twitter](https://twitter.com/akveo_inc) to get the latest news first!
We're always happy to receive your feedback!

---

# Guestway Development

## Running angular-platform with Local Nebular

Develop nebular **theme** components with hot reload while testing in angular-platform.

**The original angular-platform folder is never modified** - everything runs in an isolated shadow project.

### Quick Start

```bash
# Run with dev environment (most common)
npm run platform:dev

# First run takes ~2 min (installs dependencies)
# Subsequent runs are fast
```

### Available Commands

| Command                           | Environment | Description                        |
| --------------------------------- | ----------- | ---------------------------------- |
| `npm run platform`                | local       | Local API                          |
| `npm run platform:dev`            | dev         | Dev API (most common)              |
| `npm run platform:staging`        | staging     | Staging API                        |
| `npm run platform:prod`           | prod        | Production API                     |
| `./dev-angular-platform.sh reset` | -           | Delete shadow project, start fresh |

### How It Works

1. Creates `.angular-platform-dev/` shadow project (first run only)
2. Symlinks source files from angular-platform (no duplication)
3. Has its own `node_modules/` with `@nebular/*` → `nebular/dist/*`
4. Builds nebular packages and starts theme watcher
5. Runs dev server with file polling

```
nebular/
├── .angular-platform-dev/       # Shadow project (gitignored)
│   ├── src → ../angular-platform/src
│   ├── node_modules/@nebular/* → ../dist/*
│   └── ...
```

### Hot Reload (Theme Only)

When you edit files in `nebular/src/framework/theme/*`:

- Theme watcher rebuilds to `dist/theme` (~1-3 seconds)
- Angular detects the change (~3-10 seconds)
- Browser auto-refreshes with your changes

**Total cycle: ~5-15 seconds** from save to visible in browser.

### Other Packages (auth, security, etc.)

Changes to `auth`, `security`, `eva-icons`, etc. are **not** hot-reloaded.  
To test changes in these packages, stop and restart the script:

```bash
# Ctrl+C to stop, then re-run
npm run platform:dev
```

### Troubleshooting

If something goes wrong, reset and start fresh:

```bash
./dev-angular-platform.sh reset
npm run platform:dev
```

---

## Running Tests

### Prerequisites (macOS)

```bash
brew install chromedriver
sudo xattr -d com.apple.quarantine /opt/homebrew/bin/chromedriver
```

### Run Tests

```bash
npm run test
```
