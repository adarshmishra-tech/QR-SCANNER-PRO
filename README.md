# QRScannerPro

A high-performance QR scanner built with Expo, leveraging `expo-camera` to utilize native MLKit and VisionKit for lightning-fast, accurate QR detection.

---

## Quick Start Guide

### 1. Initialize Project

```bash
npx create-expo-app QRScannerPro
cd QRScannerPro

```

### 2. Install Dependencies

```bash
npx expo install expo-camera

```

### 3. Launch

```bash
npx expo start

```

### 4. Testing on Device

* **Install:** Download the **Expo Go** app on your physical device.
* **Connect:** Scan the QR code generated in your terminal with your device.
* **Permit:** Grant camera permissions when prompted to begin scanning.

---

## Technical Overview

The application operates through a streamlined native pipeline:

* **Camera Initialization:** Opens the device's native camera stream.
* **Real-time Detection:** Hooks into `expo-camera` to process frames via **MLKit (Android)** or **VisionKit (iOS)**.
* **Data Processing:** Instantly parses the QR data and triggers defined callbacks (e.g., auto-opening links).

---

## Requirements

* **Node.js:** Ensure the latest LTS version is installed.
* **Expo Go:** Required for testing on physical devices.

## Key Features

* **Native Performance:** Utilizes device-level vision libraries for optimal speed.
* **Lightweight:** Minimal dependency footprint.
* **Cross-Platform:** Fully compatible with both Android and iOS.
* **Zero-Config:** No complex native configuration required.

