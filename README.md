# Likemind

## Overview

Likemind is a web application designed to help individuals form relationships within unfamiliar social groups by matching them with like-minded peers based on shared interests and values. The app surveys users to create detailed profiles, then introduces them to others within the same group who have similar responses. Users can also create and administer groups, such as university cohorts or workplace communities, and invite their peers to join.

This project was inspired by our own experiences of stepping into a classroom on the first day of school without knowing anyone. We aim to ease the anxiety of these situations by helping users build connections more quickly and naturally in new environments.

Likemind also seeks to prevent missed connections in medium-sized groups (ranging from several dozen to several hundred people). In these environments, two like-minded individuals might spend years crossing paths without ever properly meeting. Our goal is to facilitate that first meaningful connection.

Developed for the COMP-1800 course, applying User-Centred Design practices, agile project management processes, and Firebase backend services.

## Technologies Used

-   **Frontend**: HTML, CSS, JavaScript
-   **Backend**: Firebase for hosting
-   **Database**: Firestore

## Usage

1. Open your browser and visit `https://bby25-likemind.web.app/`.
2. Register for an account by clicking 'Sign Up Now'.
3. Follow the prompts to create a profile.
4. Try responding to surveys on the main screen until you get a match.

---

## Project Structure

```
project-name/
├── app/
│   ├── files/
│   │   └──json files
│   ├── html/
│   │   ├──components/
│   │   │   └── html files
│   │   └── html files
│   ├── public/
│   │   ├──fonts/
│   │   │   └── font files
│   │   ├──images/
│   │   │   └── image files
│   │   ├──scripts/
│   │   │   └── js files
│   │   └──styles/
│   │       └── css files
│   ├── index.html
│   └── 404.html
├── dev
│   ├──dev files and js scripts
├── package.json
├── package-lock.json
├── README.md
├── assorted firebase files
└── .gitignore
```

---

## Contributors

-   **Shivaun Bartoo** - Former professional animator, current BCIT student with a interdiciplinary creative and technical skillset and an enthusiasm to learn.
-   **Luis Saberon** - First year BCIT student. Likes to read and play games in his paset time, both board and video. 

---

## Acknowledgments

-   Image assets sourced from [Adobe Stock](https://stock.adobe.com/)
-   Collapsable code snippit from [w3schools](https://www.w3schools.com/howto/howto_js_collapsible.asp)
-   Fonts and Icons from [Google Fonts](https://fonts.google.com/)
-   Copilot and ChatGPT used for problem solving, code documentation, debugging, and generating test-data

## Limitations and Future Work

### Limitations

-   Currently there are no admin functions for group owners.
-   There is currently no means to report or block an inappropriate account.
-   It is not currently possible to add new interests/values after initial account creation.
-   There is no way to change a user's password.

### Future Work

-   Create a desktop-adaptive version of the webpages.
-   Optimize page load times by caching data.
-   Add discord integration:
    -   Create a group from a Discord group.
    -   register with a Discord account.
    -   Discord bot for sharing invite links and group admin features.

---

## License

This project is licensed under the MIT License.
