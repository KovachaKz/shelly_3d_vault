# Shelly 3D Vault

A lightweight web-based 3D model library for browsing, previewing, and interacting with STL models related to Shelly devices.

This project provides a clean catalog interface and a dedicated viewer, built entirely with static files and powered by Three.js.

---

## Overview

Shelly 3D Vault is designed to make working with 3D printable models simple and accessible.

It allows users to:
- Browse available models in a visual grid
- Preview models directly in the browser
- Open models in a full-featured 3D viewer
- Download individual files or complete STL packs

The project runs entirely on the frontend and requires no backend or build step.

---

## Features

### Model Catalog (Landing Page)
- Responsive grid layout
- Real-time 3D previews (STL + GLB)
- Open in viewer
- Download ZIP pack

---

### 3D Viewer
- Orbit controls (rotate, zoom, pan)
- View presets (Front / Top / Side / Iso)
- Material presets (Matte / Plastic / Metal / Wireframe)
- Variant switching
- Model info panel
- Download + share link

---

### Model Configuration
All models are defined in models.js:
- Model sets
- Variants
- Viewer defaults

---

## Project Structure

/
├── index.html
├── viewer.html
├── styles.css
├── models.js
├── /models
├── /js

---

## Architecture

models.js → index.html → viewer.html → Three.js

---

## How to Run

### Python
python -m http.server 8080

### Node
npx serve .

Open:
http://localhost:8080/index.html

---
