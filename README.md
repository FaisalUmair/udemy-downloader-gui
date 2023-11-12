<span id="top"></span>
<h1 align="center">
  <img src="https://user-images.githubusercontent.com/13087389/126053559-d4c7d080-0ad3-4deb-83dd-2a52b209e5f2.png" width="128" />
  <br> Udeler | Course Downloader

  [![DeepScan](https://deepscan.io/api/teams/19612/projects/23071/branches/688725/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=19612&pid=23071&bid=688725)
  [![CodeFactor](https://www.codefactor.io/repository/github/heliomarpm/udemy-downloader-gui/badge)](https://www.codefactor.io/repository/github/heliomarpm/udemy-downloader-gui) ![CodeQL](https://github.com/heliomarpm/udemy-downloader-gui/actions/workflows/codeql-analysis.yml/badge.svg) ![Publish](https://github.com/heliomarpm/udemy-downloader-gui/actions/workflows/publish.yml/badge.svg) <a href="https://navto.me/heliomarpm" target="_blank"><img src="https://navto.me/assets/navigatetome-brand.png" width="32"/></a>

</h1>

<p align="center">
  <!-- PayPal -->
  <a href="https://bit.ly/paypal-udeler" target="_blank" rel="noopener noreferrer">
    <img alt="paypal url" src="https://img.shields.io/badge/donate%20on-paypal-1C1E26?style=for-the-badge&labelColor=1C1E26&color=0475fe"/>
  </a>
  <!-- Ko-fi -->
  <a href="https://ko-fi.com/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="kofi url" src="https://img.shields.io/badge/kofi-1C1E26?style=for-the-badge&labelColor=1C1E26&color=ff5f5f"/>
  </a>
  <!-- LiberaPay -->  
  <a href="https://liberapay.com/heliomarpm" target="_blank" rel="noopener noreferrer">
     <img alt="liberapay url" src="https://img.shields.io/badge/liberapay-1C1E26?style=for-the-badge&labelColor=1C1E26&color=f6c915"/>
  </a>
  <!-- Version -->
  <a href="https://github.com/heliomarpm/udemy-downloader-gui/releases" target="_blank" rel="noopener noreferrer">
     <img alt="releases url" src="https://img.shields.io/github/v/release/heliomarpm/udemy-downloader-gui?style=for-the-badge&labelColor=1C1E26&color=2ea043"/>
  </a>
  <!-- Downloads -->
  <a href="https://github.com/heliomarpm/udemy-downloader-gui/releases" target="_blank" rel="noopener noreferrer">
    <img alt="GitHub Downloads" src="https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/total?style=for-the-badge&labelColor=1C1E26&color=2ea043">
  </a>
  <!-- Issues -->
  <!-- <a href="https://github.com/heliomarpm/udemy-downloader-gui/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc" target="_blank">
    <img alt="GitHub issues" src="https://img.shields.io/github/issues/heliomarpm/udemy-downloader-gui?style=for-the-badge&labelColor=1C1E26">
  </a> -->
  <!-- License -->
  <a href="https://github.com/heliomarpm/udemy-downloader-gui/blob/master/LICENSE" target="_blank" rel="noopener noreferrer">
    <img alt="license url" src="https://img.shields.io/badge/license%20-MIT-1C1E26?style=for-the-badge&labelColor=1C1E26&color=61ffca"/>
  </a>
</p>

<div align="center">

  A cross-platform app to download your purchased courses (paid or free) from Udemy, the code is provided as-is and I am not held resposible for any legal issues resulting from the use of this program.<br>
  Project originally by [@FaisalUmair](https://github.com/FaisalUmair/udemy-downloader-gui) is archived.<br>
  
  ![](https://i.imgur.com/nsaAgDU.gif)

  <table border=0 cellspacing=0 celspadding=0>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/13087389/126054264-48caf1f5-472f-44b0-991a-145c9169a2c3.png" width="240px"/></td>
    <td><img src="https://user-images.githubusercontent.com/13087389/126054265-4a343a67-803a-4400-b196-090864fbc1eb.png" width="240px"/></td>
    <td><img src="https://user-images.githubusercontent.com/13087389/126076966-57f318ae-c9ee-4948-862f-87fae4502290.png" width="240px"/></td>

  </tr>
  </table>  
</div>


## Warning


* This software is intended to help you download Udemy courses for personal use only. 

* Udeler downloads the lecture videos by simply using the source of the video player returned to the user by Udemy after proper authentication, you can also do the same manually. 

* Sharing the content of your subscribed courses is strictly prohibited under Udemy Terms of Use.  

* Each and every Udemy course is subject to copyright infringement. Downloading courses is against Udemy's Terms of Service, I am NOT responsible for your account being suspended as a result of using this program!

* This software does not magically download any paid course available on Udemy, you need to provide your Udemy login credentials to download the courses you have enrolled in. 
 
* Many download managers use same method to download videos on a web page. This app only automates the process of a user doing this manually in a web browser.

* Udemy has started to encrypt many of their course videos, please do not open an issue if some/all videos are skipped. Breaking DRM encryption implies piracy, so it will not be included in this application.

* This program is WIP, the code is provided as-is and I am not held resposible for any legal issues resulting from the use of this program.


## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. \
From your command line:

```bash
# Clone this repository
git clone https://github.com/heliomarpm/udemy-downloader-gui
# Go into the repository
cd udemy-downloader-gui

# Copy file environments
copy .env.example .env
-- or if linux --
cp .env.example .env

# Install dependencies
npm install
# Run the app
npm start
-- or --
# Run the app mode develop
npm run dev
```

> **Note**: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.


# Releasing
> **Note**: to be able to perform `auto-updates` you will need a `code signed app`, for this purpose you will need to configure it by yourself, so check the [electron-builder](https://www.electron.build/code-signing) and [action-electron-builder](https://github.com/samuelmeuli/action-electron-builder#code-signing) docs please to get know how to do this.

To release your app on a GitHub release with `Windows`, `Mac` and `Linux` binaries, you can perform the following commands:

```bash
git pull
npm run make:release
```

> **Note**: Script for make release is contribution by @daltonmenezes


# Contributing:

Please make sure to read the [Contributing Guide](https://github.com/heliomarpm/udemy-downloader-gui/blob/master/docs/CONTRIBUTING.md) before making a pull request.

Thank you to all the people who already contributed to Udeler!

<a href="https://github.com/heliomarpm/udemy-downloader-gui/graphs/contributors" target="_blank">
  <img src="https://contrib.rocks/image?repo=heliomarpm/udemy-downloader-gui" />
</a>

###### Made with [contrib.rocks](https://contrib.rocks).

That said, there's a bunch of ways you can contribute to this project, like by:

- :star: Giving a star on this repository (this is very important and costs nothing)
- :beetle: Reporting a bug
- :page_facing_up: Improving this documentation
- :rotating_light: Sharing this project and recommending it to your friends
- :dollar: Supporting this project on GitHub Sponsors, PayPal, Ko-fi or Liberapay, you decide. 😉

## Donate

Udeler is free and without any ads. If you appreciate that, please consider donating to the Developer.

<p align="center">
  <!-- PayPal -->
  <a href="https://bit.ly/paypal-udeler" target="_blank" rel="noopener noreferrer">
    <img alt="paypal url" src="https://img.shields.io/badge/donate%20on-paypal-1C1E26?style=for-the-badge&labelColor=1C1E26&color=0475fe"/>
  </a>
  <!-- Ko-fi -->
  <a href="https://ko-fi.com/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="kofi url" src="https://img.shields.io/badge/kofi-1C1E26?style=for-the-badge&labelColor=1C1E26&color=ff5f5f"/>
  </a>
  <!-- LiberaPay -->  
  <a href="https://liberapay.com/heliomarpm" target="_blank" rel="noopener noreferrer">
     <img alt="liberapay url" src="https://img.shields.io/badge/liberapay-1C1E26?style=for-the-badge&labelColor=1C1E26&color=f6c915"/>
  </a>  
  <!-- GitHub Sponsors -->
  <a href="https://github.com/sponsors/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="license url" src="https://img.shields.io/badge/GitHub%20-Sponsor-1C1E26?style=for-the-badge&labelColor=1C1E26&color=db61a2"/>
  </a>
</p>

## License

[MIT © Heliomar P. Marques](https://github.com/heliomarpm/udemy-downloader-gui/blob/master/LICENSE) <a href="#top">🔝</a>
