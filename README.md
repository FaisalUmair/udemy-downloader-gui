# Udeler | Udemy Course Downloader (GUI)

A cross platform (Windows, Mac, Linux) desktop application for downloading Udemy Courses.

### Udeler 2.0 Feature Requests:

I am planning to make Udeler 2.0 a big release with a lot of new features and improvements. For requesting a feature, Click [here](https://github.com/FaisalUmair/udemy-downloader-gui/issues/172)

### Facing Login Issues?

Since Udeler v1.6.0, there is support for login through Udeler Authenticator (A chrome extension for easily authenticating a Udemy account with Udeler).

#### How to use Udeler Authenticator?

1. Install the extension from [here](https://www.udeler.com/extension)

2. After installing/enabling the extension, open udeler desktop app, you will see a new anonymous icon on the login page. Click the icon and it will start to listen for any login requests from your chrome web browser.

3. Open Udemy website on your chrome web browser and simply login to your account. Udeler app will detect the login and will let you in. If you are already logged in to Udemy, you can simply visit the website and it will still detect your account.

#### Project Update:

**`I am currently not able to give this project enough time to fix the current issues or add new features. I am busy with some other projects. But I do plan to fix all the issues and add some new features. So the maintenance is temporarily on hold and this project is not dead. I also plan to make a web only version of Udeler.`**

![](https://i.imgur.com/nsaAgDU.gif)

### :fire: Features

- _`Choose video quality.`_
- _`Download multiple courses at once.`_
- _`Set Download Start and Download End.`_
- _`Pause/Resume download at any time.`_
- _`Choose download directory.`_
- _`Multilingual (English,Italian,Spanish).`_

### Disclaimer:

This software is intended to help you download Udemy courses for personal use only. Sharing the content of your subscribed courses is strictly prohibited under Udemy Terms of Use. Each and every course on Udemy is subjected to copyright infringement.
This software does not magically download any paid course available on Udemy, you need to provide your Udemy login credentials to download the courses you have enrolled in. Udeler downloads the lecture videos by simply using the source of the video player returned to the user by Udemy after proper authentication, you can also do the same manually. Many download managers use same method to download videos on a web page. This app only automates the process of a user doing this manually in a web browser.

### Downloads:

| Platform | Arch    | Version | Link                                                                                                                         |
| -------- | ------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Windows  | x64     | 1.8.2   | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.8.2/Udeler-Setup-1.8.2-windows-x64.exe)  |
| Windows  | x86     | 1.8.2   | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.8.2/Udeler-Setup-1.8.2-windows-x86.exe)  |
| Mac      | x64     | 1.8.2   | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.8.2/Udeler-1.8.2-mac.dmg)                |
| Linux    | x86_x64 | 1.8.2   | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.8.2/Udeler-1.8.2-linux-x86_x64.AppImage) |

### Note:

By default the courses will be downloaded to the user's Download folder. The structure of course content will be preserved.

# For Developers

### Contributing:

Any contributions are welcome, if you plan to contribute please read the [contributing](https://github.com/FaisalUmair/udemy-downloader-gui/blob/master/CONTRIBUTING.md) docs first.

### Prerequisites:

```
You must have npm and nodejs installed.
```

### To use the application:

```
1. Clone the project
2. Run npm install
3. Run npm start
```

### Build:

Detect Platform:

```
npm run dist
```

Windows:

```
npm run build-win
```

Mac:

```
npm run build-mac
```

Linux:

```
npm run build-linux
```

Cross Platform:

```
npm run build
```

#### To force 32 bit build:

_Append "-- --ia32" to npm run command_

Example:

```
npm run build-win -- --ia32
```

## Donate

Udeler is free and without any ads. If you appreciate that, please consider donating to the Developer.

[![Donate](https://raw.githubusercontent.com/FaisalUmair/udemy-downloader-gui/master/assets/images/donate.png)](https://www.udeler.com/donate)
