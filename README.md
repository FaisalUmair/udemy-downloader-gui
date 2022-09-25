# Udeler | Udemy Course Downloader (GUI)
-  English is not my native language; please excuse typing errors

## Donate

Udeler is free and without any ads. If you appreciate that, please consider donating to the Developer.

[![Donate](https://raw.githubusercontent.com/heliomarpm/udemy-downloader-gui/master/assets/images/donate.png)](https://www.paypal.com/donate?business=KBVHLR7Z9V7B2&no_recurring=0&currency_code=USD) 
<noscript><a href="https://liberapay.com/heliomarpm/donate"><img alt="Donate using Liberapay" src="https://liberapay.com/assets/widgets/donate.svg"></a></noscript>

<img src="https://img.shields.io/liberapay/receives/heliomarpm.svg?logo=liberapay">

<table border=0 cellspacing=5 celspadding=5>
  <tr>
    <td width="150px">
      <img src="https://user-images.githubusercontent.com/13087389/126053559-d4c7d080-0ad3-4deb-83dd-2a52b209e5f2.png" width="128px" height="128px"/>
    </td>
    <td>
      A cross-platform app to download your purchased courses (paid or free) from Udemy.
      Project originally conceived and maintained by [@FaisalUmair](https://github.com/FaisalUmair/udemy-downloader-gui) is archived.<br>
      Since then, I've kept it active, providing fixes and small features.
    </td>
  </tr>
</table>
  
## Warning

* Downloading courses is against Udemy's Terms of Service, I am NOT held responsible for your account getting suspended as a result from the use of this program!
* Udemy has started to encrypt many of the course videos, so downloading them may be impossible/illegal because it involves decrypting DRM videos which opens up the author to DMCA takedowns/lawsuits.
* If you use Udeler and some/all videos are skipped, please don't open a new issue or comment that the issue still exists.  All requests to bypass DRM/encryption will be ignored.
* This program is WIP, the code is provided as-is and I am not held resposible for any legal issues resulting from the use of this program.

If you'd like to see the full context, then read [issue 609](https://github.com/FaisalUmair/udemy-downloader-gui/issues/609).

# Description:

This software is WIP, the code is provided as-is and I am not held resposible for any legal issues resulting from the use of this program.

This software is intended to help you download Udemy courses for personal use only.  
Sharing the content of your subscribed courses is strictly prohibited under Udemy Terms of Use.  
Each and every course on Udemy is subjected to copyright infringement.
This software does not magically download any paid course available on Udemy, you need to provide your Udemy login credentials to download the courses you have enrolled in.  
Udeler downloads the lecture videos by simply using the source of the video player returned to the user by Udemy after proper authentication, you can also do the same manually. 
Many download managers use same method to download videos on a web page. This app only automates the process of a user doing this manually in a web browser.

# License

All code is licensed under the MIT license

#Screenshots

![v187](https://user-images.githubusercontent.com/13087389/126054264-48caf1f5-472f-44b0-991a-145c9169a2c3.png)
![v187-down](https://user-images.githubusercontent.com/13087389/126054265-4a343a67-803a-4400-b196-090864fbc1eb.png)
![v187-config](https://user-images.githubusercontent.com/13087389/126076966-57f318ae-c9ee-4948-862f-87fae4502290.png)


# Contributing:

Any contributions are welcome, if you plan to contribute please read the [contributing](https://github.com/heliomarpm/udemy-downloader-gui/blob/master/CONTRIBUTING.md) docs first.

if you want help using the program, use [github issues](https://github.com/heliomarpm/udemy-downloader-gui/issues).
This version is currently only available on the Windows platform (x86, x64).
Waiting for volunteers to compile for Linux and Mac platforms.  

<a href="https://github.com/heliomarpm/udemy-downloader-gui/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=heliomarpm/udemy-downloader-gui" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

### Facing Login Issues?

Since Udeler v1.6.0, there is support for login through Udeler Authenticator (A chrome extension for easily authenticating a Udemy account with Udeler).

#### How to use Udeler Authenticator?

1. Install the extension from [here](https://www.udeler.com/extension)

2. After installing/enabling the extension, open udeler desktop app, you will see a new anonymous icon on the login page. Click the icon and it will start to listen for any login requests from your chrome web browser.

3. Open Udemy website on your chrome web browser and simply login to your account. Udeler app will detect the login and will let you in. If you are already logged in to Udemy, you can simply visit the website and it will still detect your account.  
  

### Download Previous Version for Windows, Mac and Linux

<details><summary>Expand</summary>
<p>

### Downloads:

| Platform | Arch    | Version | Link                                                                                                                         |
| -------- | ------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Windows  | x64     | 1.8.2   | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.8.2/Udeler-Setup-1.8.2-windows-x64.exe)  |
| Windows  | x86     | 1.8.2   | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.8.2/Udeler-Setup-1.8.2-windows-x86.exe)  |
| Mac      | x64     | 1.8.2   | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.8.2/Udeler-1.8.2-mac.dmg)                |
| Linux    | x86_x64 | 1.8.2   | [Download](https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.8.2/Udeler-1.8.2-linux-x86_x64.AppImage) |



</p></details>

### Prerequisites
<details><summary>Expand</summary>
<p>

```
You must have npm and nodejs installed.
```

</p></details>

### To use the application
<details><summary>Expand</summary>
<p>

```
1. Clone the project
2. Run npm install
3. Run npm start
```

</p></details>

### Build
<details><summary>Expand</summary>
<p>

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

</p></details>

### Debug
<details><summary>Expand</summary>
<p>
First run ```npm run install``` to download/setup the required libraries.

Now in Visual Studio Code press ```CTRL-SHIFT-P``` and type "Debug: Open launch.json".

Insert this:
```
{
    "version": "0.2.0",
    "configurations": [
        {
            
            "name": "Launch",
            "type": "node",
            "request": "launch",
            "program": "${workspaceRoot}/index.js",
            "stopOnEntry": false,
            "args": [],
            "cwd": "${workspaceRoot}",
            "preLaunchTask": null,
            "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/electron.cmd",
            "runtimeArgs": [
                ".",
                "--enable-logging",
                "--debug"
            ],
            "env": {},
            "console": "internalConsole",
            "sourceMaps": false,
            "outDir": null
        },
        {
            "name": "Attach",
            "type": "node",
            "request": "attach",
            "port": 5858,
            "address": "localhost",
            "restart": false,
            "sourceMaps": false,
            "outDir": null,
            "localRoot": "${workspaceRoot}",
            "remoteRoot": null
        }
    ]
}
```

(For MacOS/Linux, remove the .cmd from the runtimeExecutable.)

</p></details>

## Donate

Udeler is free and without any ads. If you appreciate that, please consider donating to the Developer.

[![Donate](https://raw.githubusercontent.com/heliomarpm/udemy-downloader-gui/master/assets/images/donate.png)](https://www.paypal.com/donate?business=KBVHLR7Z9V7B2&no_recurring=0&currency_code=USD) 
<noscript><a href="https://liberapay.com/heliomarpm/donate"><img alt="Donate using Liberapay" src="https://liberapay.com/assets/widgets/donate.svg"></a></noscript>

<img src="https://img.shields.io/liberapay/receives/heliomarpm.svg?logo=liberapay">

