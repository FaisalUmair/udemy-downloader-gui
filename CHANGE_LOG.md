# Change Log
----
## Version [1.12.2](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.12.1...v1.12.3)
##### Apr, 14 2023
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.12.3/total)

### Added
  * Badge for New Logger Count
  * Dialog Error for _EACCES: permission denied_
  * Request with the Axios library
  * feat: Amharic Locale Added by @AlAswaad99 in https://github.com/heliomarpm/udemy-downloader-gui/pull/112
  * Adding features flags (online)
  
### Fixed
  * Bug fixes pointed out by Sentry.io

### Other Changes
  * Messaging improvement
  * Refactory Settings
  * Bump minimatch and electron-builder by @dependabot in https://github.com/heliomarpm/udemy-downloader-gui/pull/101
  
----
## Version [1.12.1](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.11.10...v1.12.1)
##### Mar, 26 2023
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.12.1/total)

### Added
  * Support for Subscriber Account _[#100](https://github.com/heliomarpm/udemy-downloader-gui/issues/100) | [#105](https://github.com/heliomarpm/udemy-downloader-gui/issues/105)_
  * Global Error Handling
  
### Fixed
  * Failed to load environment variables file, impacting error monitoring

### Other Changes
  * Messaging improvement
  * Code Cleanup


----
## Version [1.11.10](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.11.6...v1.11.10)
##### Mar, 07 2023
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.11.10/total)

### Added
  1. Release for Linux and Mac - _finally!_ 😁

### Fixed
  1. Can't login _[#53](https://github.com/heliomarpm/udemy-downloader-gui/issues/53)_
  2. Login popup not closing, unable to use _[#66](https://github.com/heliomarpm/udemy-downloader-gui/issues/66)_


### Other Changes
  1. Messaging improvement
  2. Command to make release version - _for developers_

### Security
  * Update package - electron 8.5.5 to 11.5.0
  * Remove package - socket.io

----
## Version [1.11.6](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.11.5...v1.11.6)
##### Mar, 03 2023
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.11.6/total)

### Added
  1. Error monitoring with Sentry.io
  2. Link for "How to Get Access Token"
  3. Get/Set default language for new users
  4. Portable version included for Windows

### Fixed
  * Post login failure for new users


----
## Version [1.11.5](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.11.4...v1.11.5)
#### Dez, 31 2022
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.11.5/total)

### Added
  1. Save File Log - Improvement request _[#85](https://github.com/heliomarpm/udemy-downloader-gui/issues/85)_
  2. Download only the attachments and subtitles - Improvement request _[#86](https://github.com/heliomarpm/udemy-downloader-gui/issues/86)_
  3. Allow downloading video streams (M3U8) - Contributed by @CetinOzdil [PR97](https://github.com/heliomarpm/udemy-downloader-gui/pull/87)
     - _[#20](https://github.com/heliomarpm/udemy-downloader-gui/issues/20) How to download 1080p video?_
     - _[#63](https://github.com/heliomarpm/udemy-downloader-gui/issues/63) quality 1080_

### Security
  * Update package - electron 8.2.4 to 8.5.5
  * Update package - electron_builder 22.14.13 to 23.6.0
  * Update package - socket.io 4.4.1 to 4.5.4
  * Update package - mkdirp 0.5.5 to 1.0.4
  * Update package - jquery 3.6.0 to 3.6.3
  
### Refactor
  * Clean Code - #03


----
## Version [1.11.4](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.11.3...v1.11.4)
##### Aug 12, 2022
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.11.4/total)

### Added
  1. Add Floating Save Button in Config Section
  2. Remove option Auto in video quality

### Security
  * Update package - momment 2.29.1 to 2.29.4


----
## Version [1.11.3](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.11.2...v1.11.3)
##### Jul 9, 2022
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.11.3/total)

### Fixed
  1. Contributed by @freddygarcia [PR #56](https://github.com/heliomarpm/udemy-downloader-gui/pull/56) 
     - _[#49](https://github.com/heliomarpm/udemy-downloader-gui/issues/49) Stuck on "Building Course Data"_ 
  2. Adjusting the backslash in the default download path


----
## Version [1.11.2](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.11.1...v1.11.2)
##### Apr 27, 2022
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.11.2/total)

### Added
  1. Section Logger (Initial version)
  2. Remove videos protecteds e corrupteds after download

### Fixed
  1. Issue #30 (Courses not found)
  2. DRM-protected course identification
  3. A possible resolution for crash in _"Build Course Data"_


----
## Version [1.11.1](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.11.0...v1.11.1)
##### Mar 11, 2022
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.11.1/total)

### Fixed
  1. Freezing when Building course data


----
## Version [1.11.0](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.10.3...v1.11.0)
##### Feb 27, 2022
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.11.0/total)

### Changed
  1. Interface adjustments - Alert DRM Protected
  2. Interface adjustments - Rename options in setting
  3. Interface adjustments - Add donate menu

### Security
  * Update package - electron_builder 22.11.7 to 22.14.13
  * Update package - socket.io 4.1.3 to 4.4.1


----
## Version [1.10.3](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.10.2...v1.10.3)
##### Dec 20, 2021
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.10.3/total)

### Changed
  1. Include version number in titleBar
   
### Fixed
  1. Tag -infinity error
  2. Window clear after download

----
## Version [1.10.2](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.10.1...v1.10.2)
##### Dec 18, 2021
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.10.2/total)

### Changed
  1. Login with Credentials
----

## Version [1.10.1](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.10.0...v1.10.1)
##### Dec 18, 2021
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.10.1/total)

### Fixed
  1. Hotfix - Login with access token
   
### Removed
  1. Obsolete option, Authenticator
----


## Version [1.10.0](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.9.0...v1.10.0)
##### Dec 4, 2021
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.10.0/total)

### Added
  1. Option for open downloading folder
  2. New option config - Number download with zero left.
  3. New option to skip downloading attachments

### Refactor
  * Clean Code - #02
----


## Version [1.9.0](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.8.7...v1.9.0)
##### Sep 9, 2021
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.9.0/total)

### Fixed 
  1. Improved error messages
  2. Other small fixes

### Refactor
  * Clean Code - #01
----


## Version [1.8.7](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.8.6...v1.8.7)
##### Jul 17, 2021
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.8.7/total)

### Added
  1.  New option: Check for a new version on startup
  2.  New option: Start downloads at startup
  3.  New option: If course is encrypted, keep downloading attachments and videos not encrypted
  4.  Added description in flag for DRM-encrypted video.
  5.  Keeps track of which courses you have previously downloaded.
  6.  Manually hide courses already downloaded 
  7.  A button for open course in browser
  8.  When there is only one subtitle, it will not ask you to select the language.
  9.  You can configure which default subtitle language should be downloaded.
  10. Allows you to automatically start downloading the unfinished course.
  11. Download speed displaying in Kbps or Mbps units
   
### Changed
  1. Pull update from active repository from GitHub
  2. Allows you to resize the window size.
   
### Fixed
  1.  When resuming paused download
----


## Version [1.8.6](https://github.com/heliomarpm/udemy-downloader-gui/compare/v1.8.3...v1.8.6)
##### Jul 11, 2021 
![](https://img.shields.io/github/downloads/heliomarpm/udemy-downloader-gui/v1.8.6/total)

### Added
  1. Course indicator with DRM-encrypted lectures (video does not download)
  2. A new feature for dispensing items in the downloads section.
  3. A new feature for setting default Subtitle.
  4. A new feature for Save history of Started and Completed downloads.
  5. A new feature to sort attachments before downloading.
  6. Encrypted Lectures does not download, but allows you to continue downloading too many files.
  7. Option to open the selected course in the Udemy subdomain.
   
### Changed
  1. Updated Icon design by [@moenawar](https://steemkr.com/utopian-io/@moenawar/my-new-logo-design-proposal-for-udeler)
  2. Updated notification box for completed downloads
  3. Included text translation of version update popup.

![DRMProtection](https://github.com/heliomarpm/udemy-downloader-gui/releases/download/v1.8.6/screen-encrypted.png)
----


## Version 1.8.3
##### Jul 5, 2021

### Fixed
  1. The issue "Stuck on Building Course Data" [#609](https://github.com/FaisalUmair/udemy-downloader-gui/issues/609).
  2. The issue of attachment downloads
