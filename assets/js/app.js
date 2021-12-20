const electron = require("electron");
const shell = electron.shell;
const remote = electron.remote;
const dialog = remote.dialog;
const BrowserWindow = remote.BrowserWindow;
const fs = require("fs");
const prompt = require("dialogs")((opts = {}));
const mkdirp = require("mkdirp");
const homedir = require("os").homedir();
const sanitize = require("sanitize-filename");
const vtt2srt = require("node-vtt-to-srt");
const Downloader = require("mt-files-downloader");
const https = require("https");
const cookie = require("cookie");

const app = require("http").createServer();
const io = require("socket.io")(app);

const pageSize = 25;
const corruptedMP4Size = 20000;
const $loginAuthenticator = $(".ui.login.authenticator");

var headers;
var repoAccount = 'heliomarpm';
var awaitingLogin = false;


var $divSubDomain = $(".ui.login #divsubdomain");
var $subDomain = $(".ui.login #subdomain");
var subDomain = settings.get("subdomain") || "www";
var settingsCached = null;

app.listen(50490);

console.log('access_token', settings.get("access_token"));
console.table(getAllDownloadsHistory());

if (!settings.get("general")) {
  loadDefaults();
}
else {
  settingsCached = settings.getAll();
}
function loadDefaults() {
  settings.set("download", {
    checkNewVersion: true,
    autoStartDownload: false,
    continueDonwloadingEncrypted: false,
    enableDownloadStartEnd: false,
    skipAttachments: false,
    skipSubtitles: false,
    autoRetry: false,
    downloadStart: false,
    downloadEnd: false,
    videoQuality: false,
    path: false,
    defaultSubtitle: "",
    seqZeroLeft: false,
  });

  settings.set("general", {
    language: false
  });

  settingsCached = settings.getAll();
}

io.on("connect", function (socket) {
  console.log('io.onConnect');
  $loginAuthenticator.removeClass("disabled");

  socket.on("disconnect", function () {
    console.log('socket.onDisconnect');
    $loginAuthenticator.addClass("disabled");
    $(".ui.authenticator.dimmer").removeClass("active");
    awaitingLogin = false;
  });

  $loginAuthenticator.click(function () {
    $(".ui.authenticator.dimmer").addClass("active");
    awaitingLogin = true;
    socket.emit("awaitingLogin");
  });

  socket.on("newLogin", function (data) {
    console.log('socket.onNewLogin');
    if (awaitingLogin) {
      settings.set("access_token", data.access_token);
      settings.set("subdomain", data.subdomain);
      checkLogin();
    }
  });
});

electron.ipcRenderer.on("saveDownloads", function () {
  saveDownloads(true);
});

$(".ui.dropdown").dropdown();

$(document).ajaxError(function (event, request) {
  $(".dimmer").removeClass("active");
});

var downloadTemplate = `
<div class="ui tiny icon action buttons">
  <button class="ui basic blue download button"><i class="download icon"></i></button>
  <button class="ui basic red disabled pause button"><i class="pause icon"></i></button>
  <button class="ui basic green disabled resume button"><i class="play icon"></i></button>
  
  <div style="height: 1px; width: 5px;"></div>
  
  <button class="ui basic yellow open-in-browser button"><i class="desktop icon"></i></button>
  <button class="ui basic teal open-dir button"><i class="folder open icon"></i></button>
  
</div>
<div class="ui horizontal divider"></div>
<div class="ui tiny indicating individual progress">
   <div class="bar"></div>
</div>
<div class="ui horizontal divider"></div>
<div class="ui small indicating combined progress">
  <div class="bar">
    <div class="progress"></div>
  </div>
  <div class="label">${translate("Building Course Data")}</div>
</div>
<div class="info-downloaded"></div>`;

function htmlCourseCard(course, downloadSection = false) {
  if (!course.completed) { course.completed = false; }
  course.infoDownloaded = "";
  course.encryptedVideos = 0;
  course.pathDownloaded = "";

  const history = getDownloadHistory(course.id);
  if (history) {
    course.infoDownloaded = translate((history?.completed ? "Download completed on" : "Download started since")) + " " + history?.date;
    course.completed = history?.completed ? true : course.completed;
    course.encryptedVideos = history?.encryptedVideos ?? 0;
    course.selectedSubtitle = history?.selectedSubtitle ?? "";
    course.pathDownloaded = history?.pathDownloaded ?? "";
  }

  if (!fs.existsSync(course.pathDownloaded))
    course.pathDownloaded = getPathDownloadsSetting(course.title);


  const tagDismiss = `<a class="ui basic dismiss-download">${translate("Dismiss")}</a>`;

  var $course = $(`
    <div class="ui course item" course-id="${course.id}" course-url="${course.url}" course-completed="${course.completed}">
      <input type="hidden" name="encryptedvideos" value="${course.encryptedVideos}">
      <input type="hidden" name="selectedSubtitle" value="${course.selectedSubtitle}">
      <input type="hidden" name="path-downloaded" value="${course.pathDownloaded}">
      <div class="ui tiny label download-quality grey"></div>
      <div class="ui tiny grey label download-speed">
        <span class="value">0</span>
        <span class="download-unit"> KB/s</span>
      </div>

      <div class="ui tiny image wrapper">
        <div class="ui red left corner label icon-encrypted">
          <i class="lock icon"></i>
        </div>
        <img src="${(course.image ?? course.image_240x135)}" class="course-image border-radius" />
        ${(downloadSection ? tagDismiss : '')}        
        <div class="tooltip">${(course.encryptedVideos == 0 ? '' : translate("Contains encrypted videos"))}</div>
      </div>

      <div class="content">
        <span class="coursename">${course.title}</span>

        <div class="ui tiny icon green download-success message">
          <i class="check icon"></i>
          <div class="content">
            <div class="headers">
              <h4>${translate("Download Completed")}</h4>
            </div>
            <p>${translate("Click to dismiss")}</p>
          </div>
        </div>
        <div class="ui tiny icon red download-error message">
          <i class="bug icon"></i>
          <div class="content">
            <div class="headers">
              <h4>${translate("Download Failed")}</h4>
            </div>
            <p>${translate("Click to retry")}</p>
          </div>
        </div>
        <div class="ui tiny icon purple course-encrypted message">
          <i class="lock icon"></i>
          <div class="content">
            <div class="headers">
              <h4>${translate("Contains encrypted videos")}</h4>
            </div>
            <p>${translate("Click to dismiss")}</p>
          </div>
        </div>

        <div class="extra download-status">
          ${downloadTemplate}
        </div>

      </div>
      
    </div>`);

  if (!downloadSection) {
    if (course.completed) {
      resetCourse($course, $course.find(".download-success"));
    }
    else if (course.encryptedVideos > 0) {
      resetCourse($course, $course.find(".course-encrypted"));
    } else {
      $course.find(".info-downloaded").html(course.infoDownloaded).show();
    }
  }
  else {
    if (course.completed) {
      $course.find(".info-downloaded").html("<span style='color: #46C855'>" + course.infoDownloaded + "</span>").show();
    }
    else {
      $course.find(".individual.progress").progress({ percent: course.individualProgress }).show();
      $course.find(".combined.progress").progress({ percent: course.combinedProgress }).show();
      $course.find(".download-status .label").html(course.progressStatus);
      $course.find(".info-downloaded").hide();
      $course.css("padding-bottom", "25px");
    }
  }

  if (course.encryptedVideos == "0") {
    $course.find(".icon-encrypted").hide();
    $course.find(".ui.tiny.image .tooltip").hide();
    $course.find(".ui.tiny.image").removeClass("wrapper");

  } else {
    $course.find(".icon-encrypted").show()
    $course.find(".ui.tiny.image .tooltip").show();
    $course.find(".ui.tiny.image").addClass("wrapper")
  }

  if (!fs.existsSync(course.pathDownloaded)) {
    $course.find(".open-dir.button").hide();
  }

  return $course;
}

$(".ui.login #business").change(function () {
  if ($(this).is(":checked")) {
    $subDomain.val(subDomain);
    $divSubDomain.show();
  }
  else {
    $subDomain.val(null);
    $divSubDomain.hide();
  }
});

checkLogin();


$(".ui.dashboard .content").on("click", ".open-in-browser", function () {
  const link = `https://${subDomain}.udemy.com${$(this).parents(".course.item").attr('course-url')}`;
  shell.openExternal(link);
});

$(".ui.dashboard .content").on("click", ".open-dir", function () {
  const pathDownloaded = $(this).parents(".course.item").find('input[name="path-downloaded"]').val();
  shell.openItem(pathDownloaded);
});

$(".ui.dashboard .content").on("click", ".dismiss-download", function () {
  const courseId = $(this).parents(".course.item").attr('course-id');
  removeCurseDownloads(courseId);
});

$(".ui.dashboard .content").on("click", ".load-more.button", function () {
  var $this = $(this);
  var $courses = $this.prev(".courses.items");
  $.ajax({
    type: "GET",
    url: $this.data("url"),
    beforeSend: function () {
      $(".ui.dashboard .courses.dimmer").addClass("active");
    },
    headers: headers,
    success: function (response) {
      $(".ui.dashboard .courses.dimmer").removeClass("active");
      $.each(response.results, function (index, course) {
        htmlCourseCard(course).appendTo($courses);
      });
      if (!response.next) {
        $this.remove();
      } else {
        $this.data("url", response.next);
      }
    }
  });
});

$(".ui.dashboard .content").on("click", ".check-updates", function () {
  checkUpdate("heliomarpm");
});
$(".ui.dashboard .content").on("click", ".check-updates-original", function () {
  checkUpdate("FaisalUmair");
});
$(".ui.dashboard .content").on("click", ".old-version-mac", function () {
  shell.openExternal(
    'https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.8.2/Udeler-1.8.2-mac.dmg'
  );
});
$(".ui.dashboard .content").on("click", ".old-version-linux", function () {
  shell.openExternal(
    'https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.8.2/Udeler-1.8.2-linux-x86_x64.AppImage'
  );
});

$(".download-update.button").click(function () {
  shell.openExternal(
    `https://github.com/${repoAccount}/udemy-downloader-gui/releases/latest`
  );
});

function checkUpdate(account, noAlert = false) {
  $(".ui.dashboard .about.dimmer").addClass("active");
  $.getJSON(
    `https://api.github.com/repos/${account}/udemy-downloader-gui/releases/latest`,
    function (response) {
      $(".ui.dashboard .about.dimmer").removeClass("active");
      if (response.tag_name != `v${appVersion}`) {
        repoAccount = account;
        $(".ui.update-available.modal").modal("show");
      } else {
        if (noAlert == false) {
          prompt.alert(translate("No updates available"));
        }
      }
    }
  );
}


$(".ui.dashboard .content .courses.section .search.form").submit(function (e) {
  e.preventDefault();
  var keyword = $(e.target)
    .find("input")
    .val();
  if (validURL(keyword)) {
    if (keyword.search(new RegExp("^(http|https)"))) {
      keyword = "http://" + keyword;
    }
    $.ajax({
      type: "GET",
      url: keyword,
      beforeSend: function () {
        $(".ui.dashboard .course.dimmer").addClass("active");
      },
      headers: headers,
      success: function (response) {
        $(".ui.dashboard .course.dimmer").removeClass("active");
        var keyword = $(".main-content h1.clp-lead__title", response)
          .text()
          .trim();
        if (typeof keyword != "undefined" && keyword != "") {
          search(keyword, headers);
        } else {
          $(".ui.dashboard .courses.dimmer").removeClass("active");
          $(".ui.dashboard .ui.courses.section .disposable").remove();
          $(".ui.dashboard .ui.courses.section .ui.courses.items").empty();
          $(".ui.dashboard .ui.courses.section .ui.courses.items").append(
            `<div class="ui yellow message disposable">${translate("No Courses Found")}</div>`
          );
        }
      },
      error: function () {
        $(".ui.dashboard .courses.dimmer").removeClass("active");
        $(".ui.dashboard .ui.courses.section .disposable").remove();
        $(".ui.dashboard .ui.courses.section .ui.courses.items").empty();
        $(".ui.dashboard .ui.courses.section .ui.courses.items").append(
          `<div class="ui yellow message disposable">${translate("No Courses Found")}</div>`
        );
      }
    });
  } else {
    search(keyword, headers);
  }
});


$(".ui.dashboard .content").on("click", ".download-success, .course-encrypted", function () {
  $(this).hide();
  $(this)
    .parents(".course")
    .find(".download-status")
    .show();
});

$(".ui.dashboard .content").on("click", ".download.button, .download-error", function (e) {
  e.stopImmediatePropagation();
  var $course = $(this).parents(".course");
  downloadButtonClick($course);
});

function downloadButtonClick($course, subtitle) {
  var courseid = $course.attr("course-id");
  $course.find(".download-error").hide();
  $course.find(".course-encrypted").hide();
  $course.find(".download-status").show();
  $course.find(".info-downloaded").hide();
  $course.find(".icon-encrypted").hide();
  $course.find(".ui.tiny.image .tooltip").hide();
  $course.find(".ui.tiny.image").removeClass("wrapper");
  $course.find('input[name="encryptedvideos"]').val(0);
  
  var skipAttachments = settingsCached.download.skipAttachments;
  var skipSubtitles = settingsCached.download.skipSubtitles;
  var defaultSubtitle = subtitle ? subtitle : settingsCached.download.defaultSubtitle;

  // clique do botão iniciar download
  $.ajax({
    type: "GET",
    url: `https://${subDomain}.udemy.com/api-2.0/courses/${courseid}/cached-subscriber-curriculum-items?page_size=10000`,
    beforeSend: function () {
      $(".ui.dashboard .course.dimmer").addClass("active");
    },
    headers: headers,
    success: function (response) {
      $(".ui.dashboard .course.dimmer").removeClass("active");
      $course.find(".download.button").addClass("disabled");
      $course.css("padding-bottom", "25px");
      $course.find(".ui.progress").show();

      debugger
      var coursedata = [];
      coursedata["id"] = courseid;
      coursedata["chapters"] = [];
      coursedata["name"] = $course.find(".coursename").text();
      coursedata["totallectures"] = 0;
      coursedata["encryptedVideos"] = 0;
      coursedata["errorCount"] = 0;

      var chapterindex = -1;
      var lectureindex = -1;
      var remaining = response.count;
      var availableSubs = [];

      if (response.results[0]._class == "lecture") {
        chapterindex++;
        lectureindex = 0;
        coursedata["chapters"][chapterindex] = [];
        coursedata["chapters"][chapterindex]["name"] = "Chapter 1";
        coursedata["chapters"][chapterindex]["lectures"] = [];
        remaining--;
      }

      $.each(response.results, function (i, v) {

        if (v._class.toLowerCase() == "chapter") {
          chapterindex++;
          lectureindex = 0;
          coursedata["chapters"][chapterindex] = [];
          coursedata["chapters"][chapterindex]["name"] = v.title;
          coursedata["chapters"][chapterindex]["lectures"] = [];
          remaining--;
        }
        else if (
          v._class.toLowerCase() == "lecture" &&
          (v.asset.asset_type.toLowerCase() == "video" ||
            v.asset.asset_type.toLowerCase() == "article" ||
            v.asset.asset_type.toLowerCase() == "file" ||
            v.asset.asset_type.toLowerCase() == "e-book")
        ) {
          if (v.asset.asset_type.toLowerCase() != "video" && skipAttachments) {
            remaining--;
            if (!remaining) {
              if (Object.keys(availableSubs).length) {
                askForSubtitle(availableSubs, initDownload, $course, coursedata, defaultSubtitle);
              } else {
                initDownload($course, coursedata);
              }
            }
            return;
          }

          function getLecture(lecturename, chapterindex, lectureindex) {
            $.ajax({
              type: "GET",
              url: `https://${subDomain}.udemy.com/api-2.0/users/me/subscribed-courses/${courseid}/lectures/${v.id}?fields[lecture]=asset,supplementary_assets&fields[asset]=stream_urls,download_urls,captions,title,filename,data,body,media_sources,media_license_token`,
              headers: headers,
              success: function (response) {
              
                if (v.asset.asset_type.toLowerCase() == "article") {
                  if (response.asset.data) {
                    var src = response.asset.data.body;
                  }
                  else {
                    var src = response.asset.body;
                  }
                  var videoQuality = v.asset.asset_type;
                  var type = "Article";
                }
                else if (
                  v.asset.asset_type.toLowerCase() == "file" ||
                  v.asset.asset_type.toLowerCase() == "e-book"
                ) {
                  var src = response.asset.download_urls[v.asset.asset_type][0].file;
                  var videoQuality = v.asset.asset_type;
                  var type = "File";
                }
                else {
                  var type = "Video";
                  var qualities = [];
                  var qualitySrcMap = {};

                  const medias = response.asset.stream_urls?.Video ?? response.asset.media_sources;
                  medias.forEach(function (val) {
                    if (val.label.toLowerCase() != "auto") {
                      qualities.push(val.label);
                      qualitySrcMap[val.label] = val.file ?? val.src;
                    }
                  });

                  const lowest = Math.min(...qualities);
                  const highest = Math.max(...qualities);
                  var src = medias[0].src ?? medias[0].file;
                  var videoQuality = qualities.length == 0 ? "Auto" : settingsCached.download.videoQuality;
                  
                    switch (videoQuality?.toLowerCase()) {
                      case "auto":                        
                        videoQuality = medias[0].label;
                        break;
                      case "highest":
                        src = qualitySrcMap[highest];
                        videoQuality = highest;
                        break;
                      case "lowest":
                        src = qualitySrcMap[lowest];
                        videoQuality = lowest;
                        break;
                      default:
                        videoQuality = videoQuality.slice(0, -1);
                        if (qualitySrcMap[videoQuality]) {
                          src = qualitySrcMap[videoQuality];
                        } else {                          
                          videoQuality = medias[0].label;
                        }
                    }
                  
                }

                coursedata["chapters"][chapterindex]["lectures"][lectureindex] = {
                  src: src,
                  name: lecturename,
                  quality: videoQuality,
                  type: type
                };

                if (!skipSubtitles && response.asset.captions.length) {
                  coursedata["chapters"][chapterindex]["lectures"][lectureindex].caption = [];

                  response.asset.captions.forEach(function (caption) {
                    caption.video_label in availableSubs
                      ? (availableSubs[caption.video_label] = availableSubs[caption.video_label] + 1)
                      : (availableSubs[caption.video_label] = 1);

                    coursedata["chapters"][chapterindex]["lectures"][lectureindex].caption[caption.video_label] = caption.url;
                  });
                }

                if (response.supplementary_assets.length && !skipAttachments) {
                  coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"] = [];
                  var supplementary_assets_remaining = response.supplementary_assets.length;

                  $.each(response.supplementary_assets, function (a, b) {
                    $.ajax({
                      type: "GET",
                      url: `https://${subDomain}.udemy.com/api-2.0/users/me/subscribed-courses/${courseid}/lectures/${v.id}/supplementary-assets/${b.id}?fields[asset]=download_urls,external_url,asset_type`,
                      headers: headers,
                      success: function (response) {
                        if (response.download_urls) {
                          coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"]
                            .push({
                              src: response.download_urls[response.asset_type][0].file,
                              name: b.title,
                              quality: "Attachment",
                              type: "File"
                            });
                        } else {
                          coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"]
                            .push({
                              src: `<script type="text/javascript">window.location = "${response.external_url}";</script>`,
                              name: b.title,
                              quality: "Attachment",
                              type: "Url"
                            });
                        }
                        supplementary_assets_remaining--;
                        if (!supplementary_assets_remaining) {
                          remaining--;
                          coursedata["totallectures"] += 1;

                          if (!remaining) {
                            if (Object.keys(availableSubs).length) {
                              askForSubtitle(availableSubs, initDownload, $course, coursedata, defaultSubtitle);
                            } else {
                              initDownload($course, coursedata);
                            }
                          }
                        }
                      }
                    });
                  });
                }
                else {
                  remaining--;
                  coursedata["totallectures"] += 1;

                  if (!remaining) {
                    if (Object.keys(availableSubs).length) {
                      askForSubtitle(availableSubs, initDownload, $course, coursedata, defaultSubtitle);
                    } else {
                      initDownload($course, coursedata);
                    }
                  }
                }
              }
            });
          }
          getLecture(v.title, chapterindex, lectureindex);
          lectureindex++;
        }
        else if (!skipAttachments) {
          //debugger;
          coursedata["chapters"][chapterindex]["lectures"][lectureindex] = {
            src: `<script type="text/javascript">
                    window.location = "https://${subDomain}.udemy.com${$course.attr("course-url")}t/${v._class}/${v.id}";
                  </script>`,
            name: v.title,
            quality: "Attachment",
            type: "Url"
          };
          remaining--;
          coursedata["totallectures"] += 1;

          if (!remaining) {
            if (Object.keys(availableSubs).length) {
              askForSubtitle(availableSubs, initDownload, $course, coursedata, defaultSubtitle);
            } else {
              initDownload($course, coursedata);
            }
          }
          lectureindex++;
        } else {
          remaining--;

          if (!remaining) {
            if (Object.keys(availableSubs).length) {
              askForSubtitle(availableSubs, initDownload, $course, coursedata, defaultSubtitle);
            } else {
              initDownload($course, coursedata);
            }
          }
        }
      });
    },
    error: function (error) {
      $(".ui.dashboard .course.dimmer").removeClass("active");
      if (error.status == 403) {
        prompt.alert(
          translate("You do not have permission to access this course")
        );
      }
    }
  });
}

function initDownload($course, coursedata, subTitle = "") {
  var $clone = $course.clone();
  var subtitle = (Array.isArray(subTitle) ? subTitle[0] : subTitle).split('|');
  var $downloads = $(".ui.downloads.section .ui.courses.items");
  var $courses = $(".ui.courses.section .ui.courses.items");

  $course.find('input[name="selectedSubtitle"]').val(subtitle);
  if ($course.parents(".courses.section").length) {
    $downloadItem = $downloads.find("[course-id=" + $course.attr("course-id") + "]");
    if ($downloadItem.length) {
      $downloadItem.replaceWith($clone);
    } else {
      $downloads.prepend($clone);
    }
  } else {
    $courseItem = $courses.find("[course-id=" + $course.attr("course-id") + "]");
    if ($courseItem.length) {
      $courseItem.replaceWith($clone);
    }
  }
  $course.push($clone[0]);
  var timer;
  var downloader = new Downloader();
  var $actionButtons = $course.find(".action.buttons");
  var $pauseButton = $actionButtons.find(".pause.button");
  var $resumeButton = $actionButtons.find(".resume.button");
  var lectureChaperMap = {};
  var qualityColorMap = {
    144: "red",
    240: "orange",
    360: "blue",
    480: "teal",
    720: "olive",
    1080: "green",
    auto: "purple",
    Attachment: "pink",
    Subtitle: "black"
  };
  var currentLecture = 0;
  coursedata["chapters"].forEach(function (lecture, chapterindex) {
    lecture["lectures"].forEach(function (x, lectureindex) {
      currentLecture++;
      lectureChaperMap[currentLecture] = {
        chapterindex: chapterindex,
        lectureindex: lectureindex
      };
    });
  });

  var course_name = sanitize(coursedata["name"]);
  var totallectures = coursedata["totallectures"];
  var $progressElemCombined = $course.find(".combined.progress");
  var $progressElemIndividual = $course.find(".individual.progress");
  var download_directory = getPathDownloadsSetting();
  var $download_speed = $course.find(".download-speed");
  var $download_speed_value = $download_speed.find(".value");
  var $download_speed_unit = $download_speed.find(".download-unit");
  var $download_quality = $course.find(".download-quality");
  var downloaded = 0;
  var downloadStart = settingsCached.download.downloadStart;
  var downloadEnd = settingsCached.download.downloadEnd;
  var enableDownloadStartEnd = settingsCached.download.enableDownloadStartEnd;

  $course
    .css("cssText", "padding-top: 35px !important")
    .css("padding-bottom", "25px");

  $course.find('input[name="path-downloaded"]').val(`${download_directory}/${course_name}`);
  $course.find('.open-dir.button').show();

  $pauseButton.click(function () {
    stopDownload();
  });

  $resumeButton.click(function () {
    downloader._downloads[downloader._downloads.length - 1].resume();
    $resumeButton.addClass("disabled");
    $pauseButton.removeClass("disabled");
  });

  if (enableDownloadStartEnd) {
    if (downloadStart > downloadEnd) {
      downloadStart = downloadEnd;
    }

    if (downloadStart < 1) {
      downloadStart = 1;
    } else if (downloadStart > totallectures) {
      downloadStart = totallectures;
    }

    if (downloadEnd < 1 || downloadEnd > totallectures) {
      downloadEnd = totallectures;
    }

    var toDownload = downloadEnd - downloadStart + 1;
    downloadChapter(
      lectureChaperMap[downloadStart].chapterindex,
      lectureChaperMap[downloadStart].lectureindex
    );

  } else {
    var toDownload = totallectures;
    downloadChapter(0, 0);
  }

  $progressElemCombined.progress({
    total: toDownload,
    text: {
      active: `${translate("Downloaded")} {value} ${translate("out of")} {total} ${translate("items")}`
    }
  });

  $progressElemCombined.progress("reset");
  $download_speed.show();
  $download_quality.show();
  $course.find(".info-downloaded").hide();

  function stopDownload(isEncryptedVideo) {
    downloader._downloads[downloader._downloads.length - 1].stop();
    $pauseButton.addClass("disabled");
    $resumeButton.removeClass("disabled");

    if (isEncryptedVideo) {
      resetCourse($course, $course.find(".course-encrypted"));
    }
  }

  function downloadChapter(chapterindex, lectureindex) {
    const num_lectures = coursedata["chapters"][chapterindex]["lectures"].length;
    const seqName = getSequenceName(
      chapterindex + 1,
      coursedata["chapters"].length,
      coursedata["chapters"][chapterindex]["name"].trim(),
      ". ",
      download_directory + "/" + course_name
    );

    mkdirp(
      seqName.fullPath,
      function () {
        downloadLecture(chapterindex, lectureindex, num_lectures, seqName.name);
      }
    );
  }

  function downloadLecture(chapterindex, lectureindex, num_lectures, chapter_name) {
    if (downloaded == toDownload) {
      resetCourse($course, $course.find(".download-success"));
      sendNotification(download_directory + "/" + course_name, course_name, $course.find(".ui.tiny.image").find(".course-image").attr("src"));
      return;
    } else if (lectureindex == num_lectures) {
      downloadChapter(++chapterindex, 0);
      return;
    }

    const lectureType = coursedata["chapters"][chapterindex]["lectures"][lectureindex]["type"].toLowerCase();
    const lectureName = coursedata["chapters"][chapterindex]["lectures"][lectureindex]["name"].trim();

    function dlStart(dl, typeVideo, callback) {
      // Change retry options to something more forgiving and threads to keep udemy from getting upset
      dl.setRetryOptions({
        maxRetries: 3,		// Default: 5
        retryInterval: 3000 // Default: 2000
      });

      // Set download options
      dl.setOptions({
        threadsCount: 5, // Default: 2, Set the total number of download threads
        timeout: 5000,   // Default: 5000, If no data is received, the download times out (milliseconds)
        range: '0-100',  // Default: 0-100, Control the part of file that needs to be downloaded.
      });

      dl.start();
      // To track time and restarts
      let notStarted = 0;
      let reStarted = 0;

      timer = setInterval(function () {
        // Status:
        //   -3 = destroyed
        //   -2 = stopped
        //   -1 = error
        //   0 = not started
        //   1 = started (downloading)
        //   2 = error, retrying
        //   3 = finished
        switch (dl.status) {
          case 0:
            // Wait a reasonable amount of time for the download to start and if it doesn't then start another one.
            // once one of them starts the errors from the others will be ignored and we still get the file.
            if (reStarted <= 5) {
              notStarted++;
              if (notStarted >= 15) {
                dl.start();
                notStarted = 0;
                reStarted++;
              }
            }
            $download_speed_value.html(0);
            break;

          case 1:
          case -1:
            var stats = dl.getStats();
            var download_speed_and_unit = getDownloadSpeed(parseInt(stats.present.speed / 1000) || 0);
            $download_speed_value.html(download_speed_and_unit.value);
            $download_speed_unit.html(download_speed_and_unit.unit);
            $progressElemIndividual.progress("set percent", stats.total.completed);

            if (dl.status === -1
              && dl.stats.total.size == 0
              && fs.existsSync(dl.filePath)
            ) {
              dl.emit("end");
              clearInterval(timer);
            }
            else if (dl.status === -1) {
              $.ajax({
                type: "HEAD",
                url: dl.url,
                error: function (error) {
                  if (error.status == 401 || error.status == 403) {
                    fs.unlinkSync(dl.filePath);
                  }
                  resetCourse($course, $course.find(".download-error"), settingsCached.download.autoRetry, coursedata, subtitle);
                },
                success: function () {
                  resetCourse($course, $course.find(".download-error"), settingsCached.download.autoRetry, coursedata, subtitle);
                }
              });
              clearInterval(timer);
            }
            break;

          case 2:
            break;
          default:
            $download_speed_value.html(0);
        }
      }, 1000);

      dl.on("error", function (dl) {
        console.error('errorDownload', dl.error.message);
      });

      dl.on("start", function () {
        let file = (dl.filePath.split("/").slice(-2).join("/"));
        
        console.log("startDownload", file);
        $pauseButton.removeClass("disabled");
      });

      dl.on("stop", function () {
        console.warn("stopDownload");
        $pauseButton.removeClass("disabled");
      });

      dl.on("end", function () {
        if (typeVideo && dl.meta.size < corruptedMP4Size) {
          $course.find('input[name="encryptedvideos"]').val(++coursedata.encryptedVideos);
          console.warn(`${coursedata.encryptedVideos} - encryptedVideos`, dl.filePath)

          if (!settingsCached.download.continueDonwloadingEncrypted) {
            stopDownload(translate("Contains encrypted videos"));
            dl.destroy();
            return;
          }
        }
        callback();
      });
    }

    function downloadAttachments(index, total_assets) {
      $progressElemIndividual.progress("reset");

      const attachment = coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"][index];
      const attachmentName = attachment["name"].trim();

      var lectureQuality = attachment["quality"];
      var lastClass = $download_quality.attr("class").split(" ").pop();

      $download_quality
        .html(lectureQuality)
        .removeClass(lastClass)
        .addClass(qualityColorMap[lectureQuality] || "grey");

      if (attachment["type"] == "Article" || attachment["type"] == "Url") {
        const wfDir = download_directory + "/" + course_name + "/" + chapter_name;
        fs.writeFile(
          getSequenceName(
            lectureindex + 1,
            num_lectures,
            attachmentName + ".html",
            `.${index + 1} `,
            wfDir).fullPath,
          attachment["src"],
          function () {
            index++;
            if (index == total_assets) {
              $progressElemCombined.progress("increment");
              downloaded++;
              downloadLecture(chapterindex, ++lectureindex, num_lectures, chapter_name);
            }
            else {
              downloadAttachments(index, total_assets);
            }
          }
        );
      }
      else {
        //Download anexos
        let fileExtension = attachment.src.split("/").pop().split("?").shift().split(".").pop();
        fileExtension = attachment.name.split(".").pop() == fileExtension ? "" : "." + fileExtension;

        const seqName = getSequenceName(
          lectureindex + 1,
          num_lectures,
          attachmentName + fileExtension,
          `.${index + 1} `,
          `${download_directory}/${course_name}/${chapter_name}`);

        if (fs.existsSync(seqName.fullPath + ".mtd") && !fs.statSync(seqName.fullPath + ".mtd").size) {
          fs.unlinkSync(seqName.fullPath + ".mtd");
        }

        if (fs.existsSync(seqName.fullPath + ".mtd")) {
          var dl = downloader.resumeDownload(seqName.fullPath);
        }
        else if (fs.existsSync(seqName.fullPath)) {
          endDownload();
          return;
        }
        else {
          var dl = downloader.download(attachment["src"], seqName.fullPath);
        }

        dlStart(dl, attachment["type"] == "Video", endDownload);


        function endDownload() {
          index++;
          
          clearInterval(timer);
          if (index == total_assets) {
            $progressElemCombined.progress("increment");
            downloaded++;
            downloadLecture(chapterindex, ++lectureindex, num_lectures, chapter_name);
          } else {
            downloadAttachments(index, total_assets);
          }
        }
      }
    }

    function checkAttachment() {
      $progressElemIndividual.progress("reset");
      const attachment = coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"]

      if (attachment) {
        // order by name
        coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"].sort(dynamicSort("name"));

        var total_assets = attachment.length;
        var index = 0;
        downloadAttachments(index, total_assets);
      }
      else {
        $progressElemCombined.progress("increment");
        downloaded++;
        downloadLecture(chapterindex, ++lectureindex, num_lectures, chapter_name);
      }
    }

    function downloadSubtitle() {
      $progressElemIndividual.progress("reset");
      var lastClass = $download_quality
        .attr("class")
        .split(" ")
        .pop();
      $download_quality
        .html("Subtitle")
        .removeClass(lastClass)
        .addClass(qualityColorMap["Subtitle"] || "grey");
      $download_speed_value.html(0);

      const seqName = getSequenceName(
        lectureindex + 1,
        num_lectures,
        lectureName + ".srt",
        ". ",
        `${download_directory}/${course_name}/${chapter_name}`
      );

      if (fs.existsSync(seqName.fullPath)) {
        checkAttachment();
        return;
      }
      const vttFile = seqName.fullPath.replace(".srt", ".vtt");

      var file = fs.createWriteStream(vttFile).on("finish", function () {
        var finalSrt = fs.createWriteStream(seqName.fullPath).on("finish", function () {
          fs.unlinkSync(vttFile);
          checkAttachment();
        });

        fs.createReadStream(vttFile)
          .pipe(vtt2srt())
          .pipe(finalSrt);
      });

      var caption = coursedata["chapters"][chapterindex]["lectures"][lectureindex]["caption"];
      var available = [];
      $.map(subtitle, function (el) {
        if (el in caption) {
          available.push(el);
        }
      })

      var download_this_sub = available[0] || Object.keys(caption)[0] || "";
      // Prefer non "[Auto]" subs (likely entered by the creator of the lecture.)
      if (available.length > 1) {
        for (key in available) {
          if (
            available[key].indexOf("[Auto]") == -1
            || available[key].indexOf(`[${translate("Auto")}]`) == -1
          ) {
            download_this_sub = available[key];
            break;
          }
        }
      }

      // Per lecture: download maximum 1 of the language.
      var request = https.get(
        // coursedata["chapters"][chapterindex]["lectures"][lectureindex][
        //   "caption"
        // ][subtitle]
        //   ? coursedata["chapters"][chapterindex]["lectures"][lectureindex][
        //       "caption"
        //     ][subtitle]
        //   : coursedata["chapters"][chapterindex]["lectures"][lectureindex][
        //       "caption"
        //     ][
        //       Object.keys(
        //         coursedata["chapters"][chapterindex]["lectures"][lectureindex][
        //           "caption"
        //         ]
        //       )[0]
        //     ],
        caption[download_this_sub],
        function (response) {
          response.pipe(file);
        }
      );
    }

    $progressElemIndividual.progress("reset");

    var lectureQuality = coursedata["chapters"][chapterindex]["lectures"][lectureindex]["quality"];
    var lastClass = $download_quality.attr("class").split(" ").pop();
    $download_quality.html(
      lectureQuality + (lectureType == "video" ? "p" : "")
    ).removeClass(
      lastClass
    ).addClass(qualityColorMap[lectureQuality] || "grey");

    if (lectureType == "article" || lectureType == "url") {
      const wfDir = `${download_directory}/${course_name}/${chapter_name}`;
      fs.writeFile(
        getSequenceName(lectureindex + 1, num_lectures, lectureName + ".html", ". ", wfDir).fullPath,
        coursedata["chapters"][chapterindex]["lectures"][lectureindex]["src"],
        function () {
          if (
            coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"]
          ) {
            coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"].sort(dynamicSort("name"));
            var total_assets = coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"].length;
            var index = 0;
            downloadAttachments(index, total_assets);
          }
          else {
            $progressElemCombined.progress("increment");
            downloaded++;
            downloadLecture(chapterindex, ++lectureindex, num_lectures, chapter_name);
          }
        }
      );
    }
    else {
      const seqName = getSequenceName(
        lectureindex + 1,
        num_lectures,
        lectureName + (lectureType == "file" ? ".pdf" : ".mp4"),
        ". ",
        `${download_directory}/${course_name}/${chapter_name}`
      );

      if (fs.existsSync(seqName.fullPath + ".mtd") && !fs.statSync(seqName.fullPath + ".mtd").size) {
        fs.unlinkSync(seqName.fullPath + ".mtd");
      }

      if (fs.existsSync(seqName.fullPath + ".mtd")) {
        var dl = downloader.resumeDownload(seqName.fullPath);
      }
      else if (fs.existsSync(seqName.fullPath)
      ) {
        endDownloadAttachment();
        return;
      }
      else {
        var dl = downloader.download(coursedata["chapters"][chapterindex]["lectures"][lectureindex]["src"], seqName.fullPath);
      }

      dlStart(dl, lectureType == "video", endDownloadAttachment);

      function endDownloadAttachment() {
        clearInterval(timer);
        if (
          coursedata["chapters"][chapterindex]["lectures"][lectureindex].caption
        ) {
          downloadSubtitle();
        } else {
          checkAttachment();
        }
      }
    }
  }
}

function resetCourse($course, $elMessage, autoRetry, coursedata, subtitle) {
  if ($elMessage.hasClass("download-success")) {
    $course.attr('course-completed', true);
  }
  else {
    $course.attr('course-completed', '');

    if ($elMessage.hasClass("download-error")) {
      if (autoRetry && coursedata.errorCount++ < 5) {
        $course.length = 1;
        initDownload($course, coursedata, subtitle);
        return;
      }
    }
  }

  $course.find(".download-quality").hide();
  $course.find(".download-speed").hide().find(".value").html(0);
  $course.find(".download-status").hide().html(downloadTemplate);
  $course.css("padding", "14px 0px");
  $elMessage.css("display", "flex");
}

$(".courses-sidebar").click(function () {
  $(".content .ui.section").hide();
  $(".content .ui.courses.section").show();
  $(this).parent(".sidebar").find(".active").removeClass("active purple");
  $(this).addClass("active purple");
});

$(".downloads-sidebar").click(function () {
  $(".ui.dashboard .downloads.dimmer").addClass("active");
  $(".content .ui.section").hide();
  $(".content .ui.downloads.section").show();
  $(this).parent(".sidebar").find(".active").removeClass("active purple");
  $(this).addClass("active purple");

  rendererDownloads();
});

$(".settings-sidebar").click(function () {
  $(".content .ui.section").hide();
  $(".content .ui.settings.section").show();
  $(this).parent(".sidebar").find(".active").removeClass("active purple");
  $(this).addClass("active purple");

  loadSettings();
});

$(".about-sidebar").click(function () {
  $(".content .ui.section").hide();
  $(".content .ui.about.section").show();
  $(this).parent(".sidebar").find(".active").removeClass("active purple");
  $(this).addClass("active purple");
});

$(".logout-sidebar").click(function () {
  prompt.confirm(translate("Confirm Log Out?"), function (ok) {
    if (ok) {
      $(".ui.logout.dimmer").addClass("active");
      saveDownloads(false);
      settings.set("access_token", null);
      resetToLogin();
    }
  });
});

$(".content .ui.about").on("click", 'a[href^="http"]', function (e) {
  e.preventDefault();
  shell.openExternal(this.href);
});

$(".ui.settings .form").submit(e => {
  e.preventDefault();

  var checkNewVersion = $(e.target).find('input[name="check-new-version"]')[0].checked ?? true;
  var autoStartDownload = $(e.target).find('input[name="auto-start-download"]')[0].checked ?? false;
  var continueDonwloadingEncrypted = $(e.target).find('input[name="continue-downloading-encrypted"]')[0].checked ?? false;
  var enableDownloadStartEnd = $(e.target).find('input[name="enabledownloadstartend"]')[0].checked ?? false;
  var skipAttachments = $(e.target).find('input[name="skipattachments"]')[0].checked ?? false;
  var skipSubtitles = $(e.target).find('input[name="skipsubtitles"]')[0].checked ?? false;
  var autoRetry = $(e.target).find('input[name="autoretry"]')[0].checked ?? false;
  var downloadStart = parseInt($(e.target).find('input[name="downloadstart"]').val()) ?? false;
  var downloadEnd = parseInt($(e.target).find('input[name="downloadend"]').val()) ?? false;
  var videoQuality = $(e.target).find('input[name="videoquality"]').val() ?? false;
  var downloadPath = $(e.target).find('input[name="downloadpath"]').val() ?? false;
  var language = $(e.target).find('input[name="language"]').val() ?? false;
  var defaultSubtitle = $(e.target).find('input[name="defaultSubtitle"]').val() ?? false;
  var seqZeroLeft = $(e.target).find('input[name="seq-zero-left"]')[0].checked ?? false;

  settings.set("download", {
    checkNewVersion: checkNewVersion,
    autoStartDownload: autoStartDownload,
    continueDonwloadingEncrypted: continueDonwloadingEncrypted,
    enableDownloadStartEnd: enableDownloadStartEnd,
    skipAttachments: skipAttachments,
    skipSubtitles: skipSubtitles,
    autoRetry: autoRetry,
    downloadStart: downloadStart,
    downloadEnd: downloadEnd,
    videoQuality: videoQuality,
    path: downloadPath,
    defaultSubtitle: defaultSubtitle,
    seqZeroLeft: seqZeroLeft,
  });

  settings.set("general", {
    language: language
  });

  settingsCached = settings.getAll();

  prompt.alert(translate("Settings Saved"));
});

var settingsForm = $(".ui.settings .form");

function loadSettings() {

  settingsForm.find('input[name="check-new-version"]').prop("checked", settingsCached.download.checkNewVersion ?? false);
  settingsForm.find('input[name="auto-start-download"]').prop("checked", settingsCached.download.autoStartDownload ?? false);
  settingsForm.find('input[name="continue-downloading-encrypted"]').prop("checked", settingsCached.download.continueDonwloadingEncrypted ?? false);

  settingsForm.find('input[name="enabledownloadstartend"]').prop("checked", settingsCached.download.enableDownloadStartEnd ?? false);
  settingsForm.find('input[name="downloadstart"], input[name="downloadend"]').prop("readonly", settingsCached.download.enableDownloadStartEnd ?? false);

  settingsForm.find('input[name="skipattachments"]').prop("checked", settingsCached.download.skipAttachments ?? false);
  settingsForm.find('input[name="skipsubtitles"]').prop("checked", settingsCached.download.skipSubtitles ?? false);
  settingsForm.find('input[name="autoretry"]').prop("checked", settingsCached.download.autoRetry ?? false);
  settingsForm.find('input[name="seq-zero-left"]').prop("checked", settingsCached.download.seqZeroLeft ?? false);

  settingsForm.find('input[name="downloadpath"]').val(getPathDownloadsSetting());
  settingsForm.find('input[name="downloadstart"]').val(settingsCached.download.downloadStart || "");
  settingsForm.find('input[name="downloadend"]').val(settingsCached.download.downloadEnd || "");

  var videoQuality = settingsCached.download.videoQuality;
  settingsForm.find('input[name="videoquality"]').val(videoQuality || "");
  settingsForm.find('input[name="videoquality"]')
    .parent(".dropdown")
    .find(".default.text")
    .html(videoQuality || translate("Auto"));

  var language = settingsCached.general.language;
  settingsForm.find('input[name="language"]').val(language || "");
  settingsForm.find('input[name="language"]')
    .parent(".dropdown")
    .find(".default.text")
    .html(language || "English");

  var defaultSubtitle = settingsCached.download.defaultSubtitle;
  settingsForm.find('input[name="defaultSubtitle"]').val(defaultSubtitle || "");
  settingsForm.find('input[name="defaultSubtitle"]')
    .parent(".dropdown")
    .find(".defaultSubtitle.text")
    .html(defaultSubtitle || "");
}

settingsForm.find('input[name="enabledownloadstartend"]').change(function () {
  debugger;
  settingsForm.find('input[name="downloadstart"], input[name="downloadend"]').prop("readonly", !this.checked);
});

function selectDownloadPath() {
  const path = dialog.showOpenDialogSync({
    properties: ["openDirectory"]
  });

  if (path[0]) {
    fs.access(path[0], fs.R_OK && fs.W_OK, function (err) {
      if (err) {
        prompt.alert(translate("Cannot select this folder"));
      } else {
        settingsForm.find('input[name="downloadpath"]').val(path[0]);
      }
    });
  }
}

function rendererCourse(response, keyword = "") {
  $(".ui.dashboard .courses.dimmer").removeClass("active");
  $(".ui.dashboard .ui.courses.section .disposable").remove();
  $(".ui.dashboard .ui.courses.section .ui.courses.items").empty();
  if (response.results.length) {
    $.each(response.results, function (index, course) {
      $(".ui.dashboard .ui.courses.section .ui.courses.items").append(
        htmlCourseCard(course)
      );
    });
    if (response.next) {
      $(".ui.courses.section").append(
        `<button class="ui basic blue fluid load-more button disposable" data-url=${response.next}>
          ${translate("Load More")}
        </button>`
      );
    }
  } else {
    $(".ui.dashboard .ui.courses.section .ui.courses.items").append(
      `<div class="ui yellow message disposable">
        ${translate("No Courses Found")}
      </div>`
    );
  }

}

function rendererDownloads() {
  if ($(".ui.downloads.section .ui.courses.items .ui.course.item").length) {
    return;
  }
  if ((downloadedCourses = settings.get("downloadedCourses"))) {
    downloadedCourses.forEach(function (course) {
      $course = htmlCourseCard(course, true);
      $(".ui.downloads.section .ui.courses.items").append($course);
      if (!course.completed && settingsCached.download.autoStartDownload) {
        debugger;
        downloadButtonClick($course, course.selectedSubtitle);
        var $pauseButton = $course.find(".action.buttons").find(".pause.button");
        $pauseButton.removeClass("disabled");
      }
    });
  }
}

function addDownloadHistory(courseId, completed = false, encryptedVideos = 0, selectedSubtitle = "", pathDownloaded = "") {
  var item = undefined;
  const items = getAllDownloadsHistory() ?? [];

  completed = Boolean(completed);

  if (items.length > 0) {
    item = items.find(x => x.id == courseId);
  }

  if (item) {
    if (completed !== item.completed) {
      item.completed = completed;
      item.date = new Date(Date.now()).toLocaleDateString();
    }
    item.encryptedVideos = encryptedVideos;
    item.selectedSubtitle = selectedSubtitle;
    item.pathDownloaded = pathDownloaded;
  }
  else {
    item = {
      id: courseId,
      completed,
      date: new Date(Date.now()).toLocaleDateString(),
      encryptedVideos,
      selectedSubtitle,
      pathDownloaded
    }

    items.push(item)
  }

  settings.set("downloadedHistory", items);
}

function getAllDownloadsHistory() {
  return settings.get("downloadedHistory");
}

function getDownloadHistory(courseId) {
  try {
    const items = getAllDownloadsHistory() ?? [];

    if (items.length > 0) {
      return items.find(x => x.id == courseId);
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
}

function saveDownloads(quit) {
  var downloadedCourses = [];
  var $downloads = $(".ui.downloads.section .ui.courses.items .ui.course.item").slice(0);

  if ($downloads.length) {
    $downloads.each(function (index, elem) {
      $elem = $(elem);

      if ($elem.find(".progress.active").length) {
        var individualProgress = $elem.find(".download-status .individual.progress").attr("data-percent");
        var combinedProgress = $elem.find(".download-status .combined.progress").attr("data-percent");
        var completed = false;
      } else {
        var individualProgress = 0;
        var combinedProgress = 0;
        var completed = Boolean($elem.attr("course-completed"));
      }

      var course = {
        id: $elem.attr("course-id"),
        url: $elem.attr("course-url"),
        title: $elem.find(".coursename").text(),
        image: $elem.find(".image img").attr("src"),
        individualProgress: individualProgress,
        combinedProgress: combinedProgress,
        completed,
        progressStatus: $elem.find(".download-status .label").text(),
        encryptedVideos: $elem.find('input[name="encryptedvideos"]').val(),
        selectedSubtitle: $elem.find('input[name="selectedSubtitle"]').val(),
        pathDownloaded: $elem.find('input[name="path-downloaded"]').val()
      };

      downloadedCourses.push(course);
      addDownloadHistory(course.id, completed, course.encryptedVideos, course.selectedSubtitle, course.pathDownloaded);
    });

    settings.set("downloadedCourses", downloadedCourses);
  }
  if (quit) {
    electron.ipcRenderer.send("quitApp");
  }
}

function removeCurseDownloads(courseId) {
  var $downloads = $(".ui.downloads.section .ui.courses.items .ui.course.item").slice(0);

  if ($downloads.length) {
    $downloads.each(function (index, elem) {
      $elem = $(elem);
      if ($elem.attr("course-id") == courseId) {
        $elem.remove();
      }
    });
  }
}


function validURL(value) {
  var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var regexp = new RegExp(expression);
  return regexp.test(value);
}

function search(keyword, headers) {
  $.ajax({
    type: "GET",
    url: `https://${subDomain}.udemy.com/api-2.0/users/me/subscribed-courses?page_size=${pageSize}&page=1&fields[user]=job_title&search=${keyword}`,
    beforeSend: function () {
      $(".ui.dashboard .courses.dimmer").addClass("active");
    },
    headers: headers,
    success: function (response) {
      rendererCourse(response, keyword);
    }
  });
}

function askForSubtitle(availableSubs, initDownload, $course, coursedata, defaultSubtitle = "") {
  var $subtitleModal = $(".ui.subtitle.modal");
  var $subtitleDropdown = $subtitleModal.find(".ui.dropdown");
  var subtitleLanguages = [];
  var languages = [];
  var totals = {};
  var languageKeys = {};

  defaultSubtitle = defaultSubtitle.replace('[Auto]', '').replace(`[${translate("Auto")}]`, '').trim();
  for (var key in availableSubs) {
    language = key.replace('[Auto]', '').replace(`[${translate("Auto")}]`, '').trim();

    // default subtitle exists 
    if (language === defaultSubtitle) {
      initDownload($course, coursedata, key);
      return;
    }

    if (!(language in totals)) {
      languages.push(language);
      totals[language] = 0;
      languageKeys[language] = [];
    }

    totals[language] += availableSubs[key];
    languageKeys[language].push(key);
  }

  // only a subtitle
  if (languages.length == 1) {
    initDownload($course, coursedata, languageKeys[0]);
    return;
  }

  for (var language in totals) {
    totals[language] = Math.min(coursedata['totallectures'], totals[language]);
  }
  languages.sort();

  for (var key in languages) {
    var language = languages[key];
    subtitleLanguages.push({
      name: `<b>${language}</b> <i>${totals[language]} ${translate("Lectures")}</i>`,
      value: languageKeys[language].join('|')
    });
  }

  $subtitleModal.modal({ closable: false }).modal("show");

  $subtitleDropdown.dropdown({
    values: subtitleLanguages,
    onChange: function (subtitle) {
      $subtitleModal.modal("hide");
      $subtitleDropdown.dropdown({ values: [] });
      initDownload($course, coursedata, subtitle);
    }
  });
}

function loginWithUdemy() {
  if ($(".ui.login .form").find('input[name="business"]').is(":checked")) {
    if (!$subDomain.val()) {
      prompt.alert("Type Business Name");
      return;
    }
  }
  else {
    $subDomain.val(null);
  }
  var parent = remote.getCurrentWindow();
  var dimensions = parent.getSize();
  var session = remote.session;
  let udemyLoginWindow = new BrowserWindow({
    width: dimensions[0] - 100,
    height: dimensions[1] - 100,
    parent,
    modal: true
  });

  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ["*://*.udemy.com/*"] },
    function (request, callback) {

      const token = request.requestHeaders.Authorization
        ? request.requestHeaders.Authorization.split(" ")[1]
        : cookie.parse(request.requestHeaders.Cookie || '').access_token;
      
      if (token) {
        settings.set("access_token", token);
        settings.set("subdomain", new URL(request.url).hostname.split(".")[0]);
        udemyLoginWindow.destroy();
        session.defaultSession.clearStorageData();
        session.defaultSession.webRequest.onBeforeSendHeaders(
          { urls: ["*://*.udemy.com/*"] },
          function (request, callback) {            
            callback({ requestHeaders: request.requestHeaders });
          }
        );
        checkLogin();
      }
      callback({ requestHeaders: request.requestHeaders });
    }
  );

  console.log('loginWithUdemy', $subDomain.val())
  
  if ($subDomain.val()) {
    udemyLoginWindow.loadURL(`https://${$subDomain.val()}.udemy.com`);
  } else {
    udemyLoginWindow.loadURL("https://www.udemy.com/join/login-popup");
  }

}

function checkLogin() {
  if (settings.get("access_token")) {
    $(".ui.login.grid").slideUp("fast");
    $(".ui.dashboard").fadeIn("fast").css("display", "flex");
    headers = { Authorization: `Bearer ${settings.get("access_token")}` };
    $.ajax({
      type: "GET",
      url: `https://${settings.get("subdomain")}.udemy.com/api-2.0/users/me/subscribed-courses?page_size=${pageSize}`,
      beforeSend: function () {
        $(".ui.dashboard .courses.dimmer").addClass("active");
      },
      headers: headers,
      success: function (response) {
        if (settingsCached.download.checkNewVersion ?? false) {
          checkUpdate(repoAccount, true);
        }
        rendererCourse(response);
        if (settings.get("downloadedCourses")) {
          rendererDownloads()
        }

      },
      error: function (response) {
        if (response.status == 403) {
          settings.set("access_token", null);
        }
        resetToLogin();
      }
    });
  }
}


function loginWithPassword() {
  if ($(".ui.login .form").find('input[name="business"]').is(":checked")) {
    if (!$subDomain.val()) {
      prompt.alert("Type Business Name");
      return;
    }
  } else {
    $subDomain.val("www");
  }

  
  // prompt.prompt("Access Token", function (access_token) {
  //   if (access_token) {
  //     const submain = $subDomain.val();
  //     settings.set("access_token", access_token);
  //     settings.set("subdomain", submain.length == 0 ? "www" : submain);
  //     checkLogin();
  //   }
  // });
}

function loginWithAccessToken() {
  if ($(".ui.login .form").find('input[name="business"]').is(":checked")) {
    if (!$subDomain.val()) {
      prompt.alert("Type Business Name");
      return;
    }
  } else {
    $subDomain.val("www");
  }
  prompt.prompt("Access Token", function (access_token) {
    if (access_token) {
      const submain = $subDomain.val();
      settings.set("access_token", access_token);
      settings.set("subdomain", submain.length == 0 ? "www" : submain);
      checkLogin();
    }
  });
}

function resetToLogin() {
  $(".ui.dimmer").removeClass("active");
  $(".ui.dashboard .courses.items").empty();
  $(".content .ui.section").hide();
  $(".content .ui.courses.section").show();
  $(".sidebar").find(".active").removeClass("active purple");
  $(".sidebar").find(".courses-sidebar").addClass("active purple");
  $(".ui.login.grid").slideDown("fast");
  $(".ui.dashboard").fadeOut("fast");
}

// The purpose here is to have a notification sent, so the user can understand that the download ended
// The title of the notification should be translated but since the translate function is in index.html and to avoid code duplication
// I would like to have your feedback in this
function sendNotification(pathCourse, course_name, urlImage = null) {
  var notification = new Notification(course_name, {
    body: 'Download finished',
    icon: urlImage ?? __dirname + "/assets/images/build/icon.png"
  });

  notification.onclick = function () {
    shell.openItem(pathCourse);
  }
}

function getSequenceName(index, count, name, separatorIndex = ". ", path = null) {
  const sanitize_name = sanitize(name);

  const index_name = `${index}${separatorIndex}${sanitize_name}`;
  const index_path = path ? `${path}/${index_name}` : index_name;

  const seq = zeroPad(index, count);
  const sequence_name = `${seq}${separatorIndex}${sanitize_name}`;
  const sequence_path = path ? `${path}/${sequence_name}` : sequence_name;

  if (settingsCached.download.seqZeroLeft) {
    if (fs.existsSync(index_path)) {
      fs.renameSync(index_path, sequence_path);
    }

    return { name: sequence_name, fullPath: sequence_path };
  }
  else {
    if (fs.existsSync(sequence_path)) {
      fs.renameSync(sequence_path, index_path);
    }

    return { name: index_name, fullPath: index_path };
  }

}

function zeroPad(num, max) {
  return num.toString().padStart(Math.floor(Math.log10(max) + 1), '0');
}

function getDownloadSpeed(speedInKB) {
  var current_download_speed = parseInt(speedInKB) || 0;
  if (current_download_speed < 1024) {
    current_download_speed = Math.round(current_download_speed * 10) / 10;
    return { value: current_download_speed, unit: ' KB/s' };
  } else if (current_download_speed < 1024 ^ 2) {
    current_download_speed = Math.round(current_download_speed / 1024 * 10) / 10;
    return { value: current_download_speed, unit: ' MB/s' };
  } else {
    current_download_speed = Math.round(current_download_speed / (1024 ^ 2) * 10) / 10;
    return { value: current_download_speed, unit: ' GB/s' };
  }
}

// example:
//  MyData.sort(dynamicSort("name"));
//  MyData.sort(dynamicSort("-name"));
function dynamicSort(property) {
  var sortOrder = 1;

  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }

  return function (a, b) {
    if (sortOrder == -1) {
      return b[property].localeCompare(a[property]);
    } else {
      return a[property].localeCompare(b[property]);
    }
  }
}

function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function getPathDownloadsSetting(courseName = "") {
  var courseName = courseName != "" ? "/" + sanitize(courseName) : "";
  const download_directory = settingsCached.download.path || homedir + "/Downloads";
  return `${download_directory}${courseName}`;
}