<div align="center">

# ARO Renewal

### A fictional desktop. A hidden story. A system built to be explored.

The ground-up successor to [Project ARO](https://github.com/AlekdSANS/ARO).

[![Status](https://img.shields.io/badge/status-in_development-2563EB?style=flat-square)](https://github.com/AlekdSANS/aro-renewal)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=0B1F24)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)

</div>

---

## About

ARO Renewal rebuilds the original desktop-style ARG experience as a React application. It presents a fictional operating system filled with applications, folders, surveillance media, incident files, credentials, and hidden interactions that gradually reveal its story.

Instead of moving through traditional pages, players explore the narrative by using the system itself. Windows behave like desktop applications, files contain fragments of the world, and ordinary-looking interactions can lead to something deeper.

## Current Features

- Custom desktop and taskbar interface
- Draggable and resizable application windows
- Window focus and dynamic z-index ordering
- Minimize, maximize, restore, and close controls
- Responsive interface scaling
- Desktop selection box
- One-time intro sequence stored per browser session
- Surveillance-video library with an integrated media viewer
- Incident documents and PDF files
- Interactive Browser, Profile, and Vision applications
- Locked archive and hidden-content foundations
- Live date and time display

## Stack

<p>
  <img alt="React 19" src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=0B1F24">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black">
  <img alt="JSX" src="https://img.shields.io/badge/JSX-61DAFB?style=flat-square&logo=react&logoColor=0B1F24">
  <img alt="React DOM" src="https://img.shields.io/badge/React_DOM-20232A?style=flat-square&logo=react&logoColor=61DAFB">
  <img alt="Vite 8" src="https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white">
  <img alt="Sass / SCSS" src="https://img.shields.io/badge/Sass_%2F_SCSS-CC6699?style=flat-square&logo=sass&logoColor=white">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white">
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white">
  <img alt="Oxlint" src="https://img.shields.io/badge/Oxlint-7C3AED?style=flat-square&logoColor=white">
</p>

| Area | Technology |
| :--- | :--- |
| Interface | React 19, React DOM, JSX |
| Application logic | JavaScript ES modules, React hooks |
| Styling | Sass/SCSS, CSS |
| Development and builds | Vite 8 |
| Code quality | Oxlint |

## Getting Started

### Requirements

- A current Node.js release
- npm

### Installation

```bash
git clone https://github.com/AlekdSANS/aro-renewal.git
cd aro-renewal
npm install
npm run dev
```

Open the local address printed by Vite in your browser.

## Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run lint` | Run Oxlint checks |
| `npm run preview` | Preview the production build locally |

## Project Structure

```text
aro-renewal/
├── files/          # Story documents and media
├── public/         # Public static assets
├── src/
│   ├── assets/     # Interface assets
│   ├── scss/       # Sass modules and partials
│   ├── App.jsx     # Desktop, applications, and window system
│   ├── App.scss    # Main interface styling
│   └── main.jsx    # React entry point
├── package.json
└── vite.config.js
```

## Project Lineage

The original [Project ARO](https://github.com/AlekdSANS/ARO) remains available as an archive of the first implementation. ARO Renewal carries its world and interaction ideas forward with React, a more capable window system, and a foundation designed for continued development.

## Status

ARO Renewal is under active development. Applications, story content, responsive behavior, and the underlying architecture will continue to evolve.

---

<div align="center">

[Original Project ARO](https://github.com/AlekdSANS/ARO) · [ARO Renewal Repository](https://github.com/AlekdSANS/aro-renewal)

</div>
