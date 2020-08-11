const electron = require("electron");
const remote = electron.remote;
const dialog = remote.dialog;
const BrowserWindow = remote.BrowserWindow;
const fs = require("fs");
const prompt = require("dialogs")((opts = {}));
const mkdirp = require("mkdirp");
const homedir = require("os").homedir();
const sanitize = require("sanitize-filename");
const vtt2srt = require("node-vtt-to-srt");
var Downloader = require("mt-files-downloader");
var shell = require("electron").shell;
var https = require("https");
var app = require("http").createServer();
var io = require("socket.io")(app);
var headers;
const $loginAuthenticator = $(".ui.login.authenticator");

var awaitingLogin = false;

app.listen(50490);

io.on("connect", function(socket) {
  $loginAuthenticator.removeClass("disabled");

  socket.on("disconnect", function() {
    $loginAuthenticator.addClass("disabled");
    $(".ui.authenticator.dimmer").removeClass("active");
    awaitingLogin = false;
  });

  $loginAuthenticator.click(function() {
    $(".ui.authenticator.dimmer").addClass("active");
    awaitingLogin = true;
    socket.emit("awaitingLogin");
  });

  socket.on("newLogin", function(data) {
    if (awaitingLogin) {
      settings.set("access_token", data.access_token);
      settings.set("subdomain", data.subdomain);
      checkLogin();
    }
  });
});

electron.ipcRenderer.on("saveDownloads", function() {
  saveDownloads(true);
});

var subDomain = settings.get("subdomain") || "www";

var $subDomain = $(".ui.login #subdomain");

$(".ui.dropdown").dropdown();

$(document).ajaxError(function(event, request) {
  $(".dimmer").removeClass("active");
});

var downloadTemplate = `
<div class="ui tiny icon action buttons">
  <button class="ui basic blue download button"><i class="download icon"></i></button>
  <button class="ui disabled basic red pause button"><i class="pause icon"></i></button>
  <button class="ui disabled basic green resume button"><i class="play icon"></i></button>
  <button class="ui basic yellow browser button open-in-browser"><i class="desktop icon"></i></button>
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
`;

$(".ui.login #business").change(function() {
  if ($(this).is(":checked")) {
    $subDomain.show();
  } else {
    $subDomain.hide();
  }
});

checkLogin();

$(".ui.dashboard .content").on("click", ".download-success", function() {
  $(this).hide();
  $(this)
    .parents(".course")
    .find(".download-status")
    .show();
});

$(".ui.dashboard .content").on("click", ".open-in-browser",function() {
  const link = `https://www.udemy.com${$(this).parents(".course.item").attr('course-url')}`;
  shell.openExternal(link);
});


$(".ui.dashboard .content").on("click", ".load-more.button", function() {
  var $this = $(this);
  var $courses = $this.prev(".courses.items");
  $.ajax({
    type: "GET",
    url: $this.data("url"),
    beforeSend: function() {
      $(".ui.dashboard .courses.dimmer").addClass("active");
    },
    headers: headers,
    success: function(response) {
      $(".ui.dashboard .courses.dimmer").removeClass("active");
      $.each(response.results, function(index, course) {
        $(`<div class="ui course item" course-id="${course.id}" course-url="${
          course.url
        }">
                                <div class="ui tiny label download-quality grey"></div>
                                <div class="ui tiny grey label download-speed"><span class="value">0</span> KB/s</div>
                                  <div class="ui tiny image">
                                    <img src="${course.image_240x135}">
                                  </div>
                                  <div class="content">
                                    <span class="coursename">${
                                      course.title
                                    }</span>

                                  <div class="ui tiny icon green download-success message">
                                         <i class="check icon"></i>
                                          <div class="content">
                                            <div class="headers">
                                               ${translate(
                                                 "Download Completed"
                                               )}
                                             </div>
                                             <p>${translate(
                                               "Click to dismiss"
                                             )}</p>
                                           </div>
                                    </div>

                                  <div class="ui tiny icon  red download-error message">
                                         <i class="power icon"></i>
                                          <div class="content">
                                            <div class="headers">
                                               ${translate("Download Failed")}
                                             </div>
                                             <p>${translate(
                                               "Click to retry"
                                             )}</p>
                                           </div>
                                    </div>

                                    <div class="extra download-status">
                                      ${downloadTemplate}
                                    </div>

                                  </div>
                                </div>
                        `).appendTo($courses);
      });
      if (!response.next) {
        $this.remove();
      } else {
        $this.data("url", response.next);
      }
    }
  });
});

$(".ui.dashboard .content").on("click", ".check-updates", function() {
  $(".ui.dashboard .about.dimmer").addClass("active");
  $.getJSON(
    "https://api.github.com/repos/FaisalUmair/udemy-downloader-gui/releases/latest",
    function(response) {
      $(".ui.dashboard .about.dimmer").removeClass("active");
      if (response.tag_name != `v${appVersion}`) {
        $(".ui.update-available.modal").modal("show");
      } else {
        prompt.alert(translate("No updates available"));
      }
    }
  );
});

$(".ui.dashboard .content .courses.section .search.form").submit(function(e) {
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
      beforeSend: function() {
        $(".ui.dashboard .course.dimmer").addClass("active");
      },
      headers: headers,
      success: function(response) {
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
            `<div class="ui yellow message disposable">${translate(
              "No Courses Found"
            )}</div>`
          );
        }
      },
      error: function() {
        $(".ui.dashboard .courses.dimmer").removeClass("active");
        $(".ui.dashboard .ui.courses.section .disposable").remove();
        $(".ui.dashboard .ui.courses.section .ui.courses.items").empty();
        $(".ui.dashboard .ui.courses.section .ui.courses.items").append(
          `<div class="ui yellow message disposable">${translate(
            "No Courses Found"
          )}</div>`
        );
      }
    });
  } else {
    search(keyword, headers);
  }
});

$(".ui.dashboard .content").on(
  "click",
  ".download.button, .download-error",
  function(e) {
    e.stopImmediatePropagation();
    var $course = $(this).parents(".course");
    var courseid = $course.attr("course-id");
    $course.find(".download-error").hide();
    $course.find(".download-status").show();
    var settingsCached = settings.getAll();
    var skipAttachments = settingsCached.download.skipAttachments;
    var skipSubtitles = settingsCached.download.skipSubtitles;
    $.ajax({
      type: "GET",
      url: `https://${subDomain}.udemy.com/api-2.0/courses/${courseid}/cached-subscriber-curriculum-items?page_size=100000`,
      beforeSend: function() {
        $(".ui.dashboard .course.dimmer").addClass("active");
      },
      headers: headers,
      success: function(response) {
        $(".ui.dashboard .course.dimmer").removeClass("active");
        $course.find(".download.button").addClass("disabled");
        $course.css("padding-bottom", "25px");
        $course.find(".ui.progress").show();
        var coursedata = [];
        coursedata["chapters"] = [];
        coursedata["name"] = $course.find(".coursename").text();
        var chapterindex = -1;
        var lectureindex = -1;
        var remaining = response.count;
        coursedata["totallectures"] = 0;
        var availableSubs = [];

        if (response.results[0]._class == "lecture") {
          chapterindex++;
          lectureindex = 0;
          coursedata["chapters"][chapterindex] = [];
          coursedata["chapters"][chapterindex]["name"] = "Chapter 1";
          coursedata["chapters"][chapterindex]["lectures"] = [];
          remaining--;
        }

        $.each(response.results, function(i, v) {
          if (v._class == "chapter") {
            chapterindex++;
            lectureindex = 0;
            coursedata["chapters"][chapterindex] = [];
            coursedata["chapters"][chapterindex]["name"] = v.title;
            coursedata["chapters"][chapterindex]["lectures"] = [];
            remaining--;
          } else if (
            v._class == "lecture" &&
            (v.asset.asset_type == "Video" ||
              v.asset.asset_type == "Article" ||
              v.asset.asset_type == "File" ||
              v.asset.asset_type == "E-Book")
          ) {
            if (v.asset.asset_type != "Video" && skipAttachments) {
              remaining--;
              if (!remaining) {
                if (Object.keys(availableSubs).length) {
                  askforSubtile(
                    availableSubs,
                    initDownload,
                    $course,
                    coursedata
                  );
                } else {
                  initDownload($course, coursedata);
                }
              }
              return;
            }
            function getLecture(lecturename, chapterindex, lectureindex) {
              $.ajax({
                type: "GET",
                url: `https://${subDomain}.udemy.com/api-2.0/users/me/subscribed-courses/${courseid}/lectures/${v.id}?fields[asset]=stream_urls,download_urls,captions,title,filename,data,body&fields[lecture]=asset,supplementary_assets`,
                headers: headers,
                success: function(response) {
                  if (v.asset.asset_type == "Article") {
                    if (response.asset.data) {
                      var src = response.asset.data.body;
                    } else {
                      var src = response.asset.body;
                    }
                    var videoQuality = v.asset.asset_type;
                    var type = "Article";
                  } else if (
                    v.asset.asset_type == "File" ||
                    v.asset.asset_type == "E-Book"
                  ) {
                    var src =
                      response.asset.download_urls[v.asset.asset_type][0].file;
                    var videoQuality = v.asset.asset_type;
                    var type = "File";
                  } else {
                    var type = "Video";
                    var lecture = response.asset.stream_urls;
                    var qualities = [];
                    var qualitySrcMap = {};
                    lecture.Video.forEach(function(val) {
                      if (val.label == "Auto") return;
                      qualities.push(val.label);
                      qualitySrcMap[val.label] = val.file;
                    });
                    var lowest = Math.min(...qualities);
                    var highest = Math.max(...qualities);
                    var videoQuality = settingsCached.download.videoQuality;
                    if (!videoQuality || videoQuality == "Auto") {
                      var src = lecture.Video[0].file;
                      videoQuality = lecture.Video[0].label;
                    } else {
                      switch (videoQuality) {
                        case "Highest":
                          var src = qualitySrcMap[highest];
                          videoQuality = highest;
                          break;
                        case "Lowest":
                          var src = qualitySrcMap[lowest];
                          videoQuality = lowest;
                          break;
                        default:
                          videoQuality = videoQuality.slice(0, -1);
                          if (qualitySrcMap[videoQuality]) {
                            var src = qualitySrcMap[videoQuality];
                          } else {
                            var src = lecture.Video[0].file;
                            videoQuality = lecture.Video[0].label;
                          }
                      }
                    }
                  }
                  coursedata["chapters"][chapterindex]["lectures"][
                    lectureindex
                  ] = {
                    src: src,
                    name: lecturename,
                    quality: videoQuality,
                    type: type
                  };
                  if (!skipSubtitles && response.asset.captions.length) {
                    coursedata["chapters"][chapterindex]["lectures"][
                      lectureindex
                    ].caption = [];
                    response.asset.captions.forEach(function(caption) {
                      caption.video_label in availableSubs
                        ? (availableSubs[caption.video_label] =
                            availableSubs[caption.video_label] + 1)
                        : (availableSubs[caption.video_label] = 1);
                      coursedata["chapters"][chapterindex]["lectures"][
                        lectureindex
                      ].caption[caption.video_label] = caption.url;
                    });
                  }
                  if (
                    response.supplementary_assets.length &&
                    !skipAttachments
                  ) {
                    coursedata["chapters"][chapterindex]["lectures"][
                      lectureindex
                    ]["supplementary_assets"] = [];
                    var supplementary_assets_remaining =
                      response.supplementary_assets.length;
                    $.each(response.supplementary_assets, function(a, b) {
                      $.ajax({
                        type: "GET",
                        url: `https://${subDomain}.udemy.com/api-2.0/users/me/subscribed-courses/${courseid}/lectures/${v.id}/supplementary-assets/${b.id}?fields[asset]=download_urls,external_url,asset_type`,
                        headers: headers,
                        success: function(response) {
                          if (response.download_urls) {
                            coursedata["chapters"][chapterindex]["lectures"][
                              lectureindex
                            ]["supplementary_assets"].push({
                              src:
                                response.download_urls[response.asset_type][0]
                                  .file,
                              name: b.title,
                              quality: "Attachment",
                              type: "File"
                            });
                          } else {
                            coursedata["chapters"][chapterindex]["lectures"][
                              lectureindex
                            ]["supplementary_assets"].push({
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
                                askforSubtile(
                                  availableSubs,
                                  initDownload,
                                  $course,
                                  coursedata
                                );
                              } else {
                                initDownload($course, coursedata);
                              }
                            }
                          }
                        }
                      });
                    });
                  } else {
                    remaining--;
                    coursedata["totallectures"] += 1;
                    if (!remaining) {
                      if (Object.keys(availableSubs).length) {
                        askforSubtile(
                          availableSubs,
                          initDownload,
                          $course,
                          coursedata
                        );
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
          } else if (!skipAttachments) {
            coursedata["chapters"][chapterindex]["lectures"][lectureindex] = {
              src: `<script type="text/javascript">window.location = "https://${subDomain}.udemy.com${$course.attr(
                "course-url"
              )}t/${v._class}/${v.id}";</script>`,
              name: v.title,
              quality: "Attachment",
              type: "Url"
            };
            remaining--;
            coursedata["totallectures"] += 1;
            if (!remaining) {
              if (Object.keys(availableSubs).length) {
                askforSubtile(availableSubs, initDownload, $course, coursedata);
              } else {
                initDownload($course, coursedata);
              }
            }
            lectureindex++;
          } else {
            remaining--;
            if (!remaining) {
              if (Object.keys(availableSubs).length) {
                askforSubtile(availableSubs, initDownload, $course, coursedata);
              } else {
                initDownload($course, coursedata);
              }
            }
          }
        });
      },
      error: function(error) {
        $(".ui.dashboard .course.dimmer").removeClass("active");
        if (error.status == 403) {
          prompt.alert(
            translate("You do not have permission to access this course")
          );
        }
      }
    });
  }
);

function initDownload($course, coursedata, subtitle = false) {
  var $clone = $course.clone();
  var $downloads = $(".ui.downloads.section .ui.courses.items");
  var $courses = $(".ui.courses.section .ui.courses.items");
  if ($course.parents(".courses.section").length) {
    $downloadItem = $downloads.find(
      "[course-id=" + $course.attr("course-id") + "]"
    );
    if ($downloadItem.length) {
      $downloadItem.replaceWith($clone);
    } else {
      $downloads.prepend($clone);
    }
  } else {
    $courseItem = $courses.find(
      "[course-id=" + $course.attr("course-id") + "]"
    );
    if ($courseItem.length) {
      $courseItem.replaceWith($clone);
    }
  }
  $course.push($clone[0]);
  var timer;
  var downloader = new Downloader();
  var $downloadStatus = $course.find(".download-status");
  var $actionButtons = $course.find(".action.buttons");
  var $downloadButton = $actionButtons.find(".download.button");
  var $pauseButton = $actionButtons.find(".pause.button");
  var $resumeButton = $actionButtons.find(".resume.button");
  var lectureChaperMap = {};
  var qualityColorMap = {
    "144": "red",
    "240": "orange",
    "360": "blue",
    "480": "teal",
    "720": "olive",
    "1080": "green",
    Attachment: "pink",
    Subtitle: "black"
  };
  var currentLecture = 0;
  coursedata["chapters"].forEach(function(lecture, chapterindex) {
    lecture["lectures"].forEach(function(x, lectureindex) {
      currentLecture++;
      lectureChaperMap[currentLecture] = {
        chapterindex: chapterindex,
        lectureindex: lectureindex
      };
    });
  });

  var course_name = sanitize(coursedata["name"]);
  var totalchapters = coursedata["chapters"].length;
  var totallectures = coursedata["totallectures"];
  var $progressElemCombined = $course.find(".combined.progress");
  var $progressElemIndividual = $course.find(".individual.progress");
  var settingsCached = settings.getAll();
  var download_directory =
    settingsCached.download.path || homedir + "/Downloads";
  var $download_speed = $course.find(".download-speed");
  var $download_speed_value = $download_speed.find(".value");
  var $download_quality = $course.find(".download-quality");
  var downloaded = 0;
  var downloadStart = settingsCached.download.downloadStart;
  var downloadEnd = settingsCached.download.downloadEnd;
  var enableDownloadStartEnd = settingsCached.download.enableDownloadStartEnd;
  var autoRetry = settingsCached.download.autoRetry;
  $course
    .css("cssText", "padding-top: 35px !important")
    .css("padding-bottom", "25px");

  $pauseButton.click(function() {
    downloader._downloads[downloader._downloads.length - 1].stop();
    $pauseButton.addClass("disabled");
    $resumeButton.removeClass("disabled");
  });

  $resumeButton.click(function() {
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
      active: `${translate("Downloaded")} {value} ${translate(
        "out of"
      )} {total} ${translate("items")}`
    }
  });

  $progressElemCombined.progress("reset");
  $download_speed.show();
  $download_quality.show();

  function downloadChapter(chapterindex, lectureindex) {
    var num_lectures = coursedata["chapters"][chapterindex]["lectures"].length;
    var chapter_name = sanitize(
      chapterindex + 1 + ". " + coursedata["chapters"][chapterindex]["name"]
    );
    mkdirp(
      download_directory + "/" + course_name + "/" + chapter_name,
      function() {
        downloadLecture(chapterindex, lectureindex, num_lectures, chapter_name);
      }
    );
  }

  function downloadLecture(
    chapterindex,
    lectureindex,
    num_lectures,
    chapter_name
  ) {
    if (downloaded == toDownload) {
      resetCourse($course.find(".download-success"));
      return;
    } else if (lectureindex == num_lectures) {
      downloadChapter(++chapterindex, 0);
      return;
    }

    function dlStart(dl, callback) {
      // Change retry options to something more forgiving and threads to keep udemy from getting upset
      dl.setRetryOptions({
        retryInterval: 5000
      });

      dl.setOptions({
        threadsCount: 5
      });

      dl.start();
      // To track time and restarts
      let notStarted = 0;
      let reStarted = 0;

      timer = setInterval(function() {
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
            var stats = dl.getStats();
            $download_speed_value.html(
              parseInt(stats.present.speed / 1000) || 0
            );
            $progressElemIndividual.progress(
              "set percent",
              stats.total.completed
            );
            break;
          case 2:
            break;
          case -1:
            var stats = dl.getStats();
            $download_speed_value.html(
              parseInt(stats.present.speed / 1000) || 0
            );
            $progressElemIndividual.progress(
              "set percent",
              stats.total.completed
            );
            if (
              dl.stats.total.size == 0 &&
              dl.status == -1 &&
              fs.existsSync(dl.filePath)
            ) {
              dl.emit("end");
              clearInterval(timer);
              break;
            } else {
              $.ajax({
                type: "HEAD",
                url: dl.url,
                error: function(error) {
                  if (error.status == 401 || error.status == 403) {
                    fs.unlinkSync(dl.filePath);
                  }
                  resetCourse($course.find(".download-error"));
                },
                success: function() {
                  resetCourse($course.find(".download-error"));
                }
              });
              clearInterval(timer);
              break;
            }
          default:
            $download_speed_value.html(0);
        }
      }, 1000);

      dl.on("error", function(dl) {
        // Prevent throwing uncaught error
      });

      dl.on("start", function() {
        $pauseButton.removeClass("disabled");
      });

      dl.on("end", function() {
        callback();
      });
    }

    function downloadAttachments(index, total_assets) {
      $progressElemIndividual.progress("reset");
      var lectureQuality =
        coursedata["chapters"][chapterindex]["lectures"][lectureindex][
          "supplementary_assets"
        ][index]["quality"];
      var lastClass = $download_quality
        .attr("class")
        .split(" ")
        .pop();
      $download_quality
        .html(lectureQuality)
        .removeClass(lastClass)
        .addClass(qualityColorMap[lectureQuality] || "grey");

      if (
        coursedata["chapters"][chapterindex]["lectures"][lectureindex][
          "supplementary_assets"
        ][index]["type"] == "Article" ||
        coursedata["chapters"][chapterindex]["lectures"][lectureindex][
          "supplementary_assets"
        ][index]["type"] == "Url"
      ) {
        fs.writeFile(
          download_directory +
            "/" +
            course_name +
            "/" +
            chapter_name +
            "/" +
            sanitize(
              lectureindex +
                1 +
                "." +
                (index + 1) +
                " " +
                coursedata["chapters"][chapterindex]["lectures"][lectureindex][
                  "supplementary_assets"
                ][index]["name"].trim() +
                ".html"
            ),
          coursedata["chapters"][chapterindex]["lectures"][lectureindex][
            "supplementary_assets"
          ][index]["src"],
          function() {
            index++;
            if (index == total_assets) {
              $progressElemCombined.progress("increment");
              downloaded++;
              downloadLecture(
                chapterindex,
                ++lectureindex,
                num_lectures,
                chapter_name
              );
            } else {
              downloadAttachments(index, total_assets);
            }
          }
        );
      } else {
        var lecture_name = sanitize(
          lectureindex +
            1 +
            "." +
            (index + 1) +
            " " +
            coursedata["chapters"][chapterindex]["lectures"][lectureindex][
              "supplementary_assets"
            ][index]["name"].trim() +
            (coursedata["chapters"][chapterindex]["lectures"][lectureindex][
              "supplementary_assets"
            ][index]["name"]
              .split(".")
              .pop() ==
            coursedata["chapters"][chapterindex]["lectures"][lectureindex][
              "supplementary_assets"
            ][index]["src"]
              .split("/")
              .pop()
              .split(".")
              .pop()
              .split("?")
              .shift()
              ? ""
              : "." +
                coursedata["chapters"][chapterindex]["lectures"][lectureindex][
                  "supplementary_assets"
                ][index]["src"]
                  .split("/")
                  .pop()
                  .split(".")
                  .pop()
                  .split("?")
                  .shift())
        );
        if (
          fs.existsSync(
            download_directory +
              "/" +
              course_name +
              "/" +
              chapter_name +
              "/" +
              lecture_name +
              ".mtd"
          )
        ) {
          var dl = downloader.resumeDownload(
            download_directory +
              "/" +
              course_name +
              "/" +
              chapter_name +
              "/" +
              lecture_name
          );
          if (
            !fs.statSync(
              download_directory +
                "/" +
                course_name +
                "/" +
                chapter_name +
                "/" +
                lecture_name +
                ".mtd"
            ).size
          ) {
            dl = downloader.download(
              coursedata["chapters"][chapterindex]["lectures"][lectureindex][
                "supplementary_assets"
              ][index]["src"],
              download_directory +
                "/" +
                course_name +
                "/" +
                chapter_name +
                "/" +
                lecture_name
            );
          }
        } else if (
          fs.existsSync(
            download_directory +
              "/" +
              course_name +
              "/" +
              chapter_name +
              "/" +
              lecture_name
          )
        ) {
          endDownload();
          return;
        } else {
          var dl = downloader.download(
            coursedata["chapters"][chapterindex]["lectures"][lectureindex][
              "supplementary_assets"
            ][index]["src"],
            download_directory +
              "/" +
              course_name +
              "/" +
              chapter_name +
              "/" +
              lecture_name
          );
        }

        dlStart(dl, endDownload);

        function endDownload() {
          index++;
          $pauseButton.addClass("disabled");
          clearInterval(timer);
          if (index == total_assets) {
            $progressElemCombined.progress("increment");
            downloaded++;
            downloadLecture(
              chapterindex,
              ++lectureindex,
              num_lectures,
              chapter_name
            );
          } else {
            downloadAttachments(index, total_assets);
          }
        }
      }
    }

    function checkAttachment() {
      $progressElemIndividual.progress("reset");
      if (
        coursedata["chapters"][chapterindex]["lectures"][lectureindex][
          "supplementary_assets"
        ]
      ) {
        var total_assets =
          coursedata["chapters"][chapterindex]["lectures"][lectureindex][
            "supplementary_assets"
          ].length;
        var index = 0;
        downloadAttachments(index, total_assets);
      } else {
        $progressElemCombined.progress("increment");
        downloaded++;
        downloadLecture(
          chapterindex,
          ++lectureindex,
          num_lectures,
          chapter_name
        );
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
      var lecture_name = sanitize(
        lectureindex +
          1 +
          ". " +
          coursedata["chapters"][chapterindex]["lectures"][lectureindex][
            "name"
          ].trim() +
          ".vtt"
      );
      if (
        fs.existsSync(
          download_directory +
            "/" +
            course_name +
            "/" +
            chapter_name +
            "/" +
            lecture_name.replace(".vtt", ".srt")
        )
      ) {
        checkAttachment();
        return;
      }
      var file = fs
        .createWriteStream(
          download_directory +
            "/" +
            course_name +
            "/" +
            chapter_name +
            "/" +
            lecture_name
        )
        .on("finish", function() {
          var finalSrt = fs
            .createWriteStream(
              download_directory +
                "/" +
                course_name +
                "/" +
                chapter_name +
                "/" +
                lecture_name.replace(".vtt", ".srt")
            )
            .on("finish", function() {
              fs.unlinkSync(
                download_directory +
                  "/" +
                  course_name +
                  "/" +
                  chapter_name +
                  "/" +
                  lecture_name
              );
              checkAttachment();
            });
          fs.createReadStream(
            download_directory +
              "/" +
              course_name +
              "/" +
              chapter_name +
              "/" +
              lecture_name
          )
            .pipe(vtt2srt())
            .pipe(finalSrt);
        });

      var request = https.get(
        coursedata["chapters"][chapterindex]["lectures"][lectureindex][
          "caption"
        ][subtitle]
          ? coursedata["chapters"][chapterindex]["lectures"][lectureindex][
              "caption"
            ][subtitle]
          : coursedata["chapters"][chapterindex]["lectures"][lectureindex][
              "caption"
            ][
              Object.keys(
                coursedata["chapters"][chapterindex]["lectures"][lectureindex][
                  "caption"
                ]
              )[0]
            ],
        function(response) {
          response.pipe(file);
        }
      );
    }

    $progressElemIndividual.progress("reset");

    var lectureQuality =
      coursedata["chapters"][chapterindex]["lectures"][lectureindex]["quality"];
    var lastClass = $download_quality
      .attr("class")
      .split(" ")
      .pop();
    $download_quality
      .html(
        lectureQuality +
          (coursedata["chapters"][chapterindex]["lectures"][lectureindex][
            "type"
          ] == "Video"
            ? "p"
            : "")
      )
      .removeClass(lastClass)
      .addClass(qualityColorMap[lectureQuality] || "grey");

    if (
      coursedata["chapters"][chapterindex]["lectures"][lectureindex]["type"] ==
        "Article" ||
      coursedata["chapters"][chapterindex]["lectures"][lectureindex]["type"] ==
        "Url"
    ) {
      fs.writeFile(
        download_directory +
          "/" +
          course_name +
          "/" +
          chapter_name +
          "/" +
          sanitize(
            lectureindex +
              1 +
              ". " +
              coursedata["chapters"][chapterindex]["lectures"][lectureindex][
                "name"
              ].trim() +
              ".html"
          ),
        coursedata["chapters"][chapterindex]["lectures"][lectureindex]["src"],
        function() {
          if (
            coursedata["chapters"][chapterindex]["lectures"][lectureindex][
              "supplementary_assets"
            ]
          ) {
            var total_assets =
              coursedata["chapters"][chapterindex]["lectures"][lectureindex][
                "supplementary_assets"
              ].length;
            var index = 0;
            downloadAttachments(index, total_assets);
          } else {
            $progressElemCombined.progress("increment");
            downloaded++;
            downloadLecture(
              chapterindex,
              ++lectureindex,
              num_lectures,
              chapter_name
            );
          }
        }
      );
    } else {
      var lecture_name = sanitize(
        lectureindex +
          1 +
          ". " +
          coursedata["chapters"][chapterindex]["lectures"][lectureindex][
            "name"
          ].trim() +
          "." +
          (coursedata["chapters"][chapterindex]["lectures"][lectureindex][
            "type"
          ] == "File"
            ? "pdf"
            : "mp4")
      );
      if (
        fs.existsSync(
          download_directory +
            "/" +
            course_name +
            "/" +
            chapter_name +
            "/" +
            lecture_name +
            ".mtd"
        )
      ) {
        var dl = downloader.resumeDownload(
          download_directory +
            "/" +
            course_name +
            "/" +
            chapter_name +
            "/" +
            lecture_name
        );
        if (
          !fs.statSync(
            download_directory +
              "/" +
              course_name +
              "/" +
              chapter_name +
              "/" +
              lecture_name +
              ".mtd"
          ).size
        ) {
          dl = downloader.download(
            coursedata["chapters"][chapterindex]["lectures"][lectureindex][
              "src"
            ],
            download_directory +
              "/" +
              course_name +
              "/" +
              chapter_name +
              "/" +
              lecture_name
          );
        }
      } else if (
        fs.existsSync(
          download_directory +
            "/" +
            course_name +
            "/" +
            chapter_name +
            "/" +
            lecture_name
        )
      ) {
        endDownload();
        return;
      } else {
        var dl = downloader.download(
          coursedata["chapters"][chapterindex]["lectures"][lectureindex]["src"],
          download_directory +
            "/" +
            course_name +
            "/" +
            chapter_name +
            "/" +
            lecture_name
        );
      }

      dlStart(dl, endDownload);

      function endDownload() {
        $pauseButton.addClass("disabled");
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

  function resetCourse($elem) {
    if ($elem.hasClass("download-error") && autoRetry) {
      $course.length = 1;
      initDownload($course, coursedata, subtitle);
      return;
    }
    $download_speed.hide();
    $download_quality.hide();
    $download_speed_value.html(0);
    $downloadStatus.hide().html(downloadTemplate);
    $elem.css("display", "flex");
    $course.css("padding", "14px 0px");
  }
}

$(".courses-sidebar").click(function() {
  $(".content .ui.section").hide();
  $(".content .ui.courses.section").show();
  $(this)
    .parent(".sidebar")
    .find(".active")
    .removeClass("active red");
  $(this).addClass("active red");
});

$(".downloads-sidebar").click(function() {
  $(".ui.dashboard .downloads.dimmer").addClass("active");
  $(".content .ui.section").hide();
  $(".content .ui.downloads.section").show();
  $(this)
    .parent(".sidebar")
    .find(".active")
    .removeClass("active red");
  $(this).addClass("active red");
  loadDownloads();
});

$(".settings-sidebar").click(function() {
  $(".content .ui.section").hide();
  $(".content .ui.settings.section").show();
  $(this)
    .parent(".sidebar")
    .find(".active")
    .removeClass("active red");
  $(this).addClass("active red");
  loadSettings();
});

$(".about-sidebar").click(function() {
  $(".content .ui.section").hide();
  $(".content .ui.about.section").show();
  $(this)
    .parent(".sidebar")
    .find(".active")
    .removeClass("active red");
  $(this).addClass("active red");
});

$(".logout-sidebar").click(function() {
  prompt.confirm("Confirm Log Out?", function(ok) {
    if (ok) {
      $(".ui.logout.dimmer").addClass("active");
      saveDownloads(false);
      settings.set("access_token", false);
      resetToLogin();
    }
  });
});

$(".download-update.button").click(function() {
  shell.openExternal(
    "https://github.com/FaisalUmair/udemy-downloader-gui/releases/latest"
  );
});

$(".content .ui.about").on("click", 'a[href^="http"]', function(e) {
  e.preventDefault();
  shell.openExternal(this.href);
});

$(".ui.settings .form").submit(e => {
  e.preventDefault();
  var enableDownloadStartEnd = $(e.target).find(
    'input[name="enabledownloadstartend"]'
  )[0].checked;
  var skipAttachments = $(e.target).find('input[name="skipattachments"]')[0]
    .checked;
  var skipSubtitles = $(e.target).find('input[name="skipsubtitles"]')[0]
    .checked;
  var autoRetry = $(e.target).find('input[name="autoretry"]')[0].checked;
  var downloadStart =
    parseInt(
      $(e.target)
        .find('input[name="downloadstart"]')
        .val()
    ) || false;
  var downloadEnd =
    parseInt(
      $(e.target)
        .find('input[name="downloadend"]')
        .val()
    ) || false;
  var videoQuality =
    $(e.target)
      .find('input[name="videoquality"]')
      .val() || false;
  var downloadPath =
    $(e.target)
      .find('input[name="downloadpath"]')
      .val() || false;
  var language =
    $(e.target)
      .find('input[name="language"]')
      .val() || false;

  settings.set("download", {
    enableDownloadStartEnd: enableDownloadStartEnd,
    skipAttachments: skipAttachments,
    skipSubtitles: skipSubtitles,
    autoRetry: autoRetry,
    downloadStart: downloadStart,
    downloadEnd: downloadEnd,
    videoQuality: videoQuality,
    path: downloadPath
  });

  settings.set("general", {
    language: language
  });

  prompt.alert(translate("Settings Saved"));
});

var settingsForm = $(".ui.settings .form");

function loadSettings() {
  var settingsCached = settings.getAll();
  if (settingsCached.download.enableDownloadStartEnd) {
    settingsForm
      .find('input[name="enabledownloadstartend"]')
      .prop("checked", true);
  } else {
    settingsForm
      .find('input[name="enabledownloadstartend"]')
      .prop("checked", false);
    settingsForm
      .find('input[name="downloadstart"], input[name="downloadend"]')
      .prop("readonly", true);
  }

  if (settingsCached.download.skipAttachments) {
    settingsForm.find('input[name="skipattachments"]').prop("checked", true);
  } else {
    settingsForm.find('input[name="skipattachments"]').prop("checked", false);
  }

  if (settingsCached.download.skipSubtitles) {
    settingsForm.find('input[name="skipsubtitles"]').prop("checked", true);
  } else {
    settingsForm.find('input[name="skipsubtitles"]').prop("checked", false);
  }

  if (settingsCached.download.autoRetry) {
    settingsForm.find('input[name="autoretry"]').prop("checked", true);
  } else {
    settingsForm.find('input[name="autoretry"]').prop("checked", false);
  }

  settingsForm
    .find('input[name="downloadpath"]')
    .val(settingsCached.download.path || homedir + "/Downloads");
  settingsForm
    .find('input[name="downloadstart"]')
    .val(settingsCached.download.downloadStart || "");
  settingsForm
    .find('input[name="downloadend"]')
    .val(settingsCached.download.downloadEnd || "");
  var videoQuality = settingsCached.download.videoQuality;
  settingsForm.find('input[name="videoquality"]').val(videoQuality || "");
  settingsForm
    .find('input[name="videoquality"]')
    .parent(".dropdown")
    .find(".default.text")
    .html(videoQuality || translate("Auto"));
  var language = settingsCached.general.language;
  settingsForm.find('input[name="language"]').val(language || "");
  settingsForm
    .find('input[name="language"]')
    .parent(".dropdown")
    .find(".default.text")
    .html(language || "English");
}

settingsForm.find('input[name="enabledownloadstartend"]').change(function() {
  if (this.checked) {
    settingsForm
      .find('input[name="downloadstart"], input[name="downloadend"]')
      .prop("readonly", false);
  } else {
    settingsForm
      .find('input[name="downloadstart"], input[name="downloadend"]')
      .prop("readonly", true);
  }
});

function selectDownloadPath() {
  const path = dialog.showOpenDialogSync({
    properties: ["openDirectory"]
  });

  if (path[0]) {
    fs.access(path[0], fs.R_OK && fs.W_OK, function(err) {
      if (err) {
        prompt.alert(translate("Cannot select this folder"));
      } else {
        settingsForm.find('input[name="downloadpath"]').val(path[0]);
      }
    });
  }
}

function handleResponse(response, keyword = "") {
  $(".ui.dashboard .courses.dimmer").removeClass("active");
  $(".ui.dashboard .ui.courses.section .disposable").remove();
  $(".ui.dashboard .ui.courses.section .ui.courses.items").empty();
  if (response.results.length) {
    $.each(response.results, function(index, course) {
      $(".ui.dashboard .ui.courses.section .ui.courses.items").append(`
                  <div class="ui course item course-item" course-id="${
                    course.id
                  }" course-url="${course.url}">
                  <div class="ui tiny label download-quality grey"></div>
                  <div class="ui tiny grey label download-speed"><span class="value">0</span> KB/s</div>
                    <div class="ui tiny image">
                      <img src="${course.image_240x135}">
                    </div>
                    <div class="content">
                      <span class="coursename">${course.title}</span>

                    <div class="ui tiny icon green download-success message">
                           <i class="check icon"></i>
                            <div class="content">
                              <div class="headers">
                                 ${translate("Download Completed")}
                               </div>
                               <p>${translate("Click to dismiss")}</p>
                             </div>
                      </div>

                    <div class="ui tiny icon  red download-error message">
                           <i class="power icon"></i>
                            <div class="content">
                              <div class="headers">
                                 ${translate("Download Failed")}
                               </div>
                               <p>${translate("Click to retry")}</p>
                             </div>
                      </div>

                      <div class="extra download-status">
                        ${downloadTemplate}
                      </div>

                    </div>
                  </div>
          `);
    });
    if (response.next) {
      $(".ui.courses.section").append(
        `<button class="ui basic blue fluid load-more button disposable" data-url=${
          response.next
        }>${translate("Load More")}</button>`
      );
    }
  } else {
    $(".ui.dashboard .ui.courses.section .ui.courses.items").append(
      `<div class="ui yellow message disposable">${translate(
        "No Courses Found"
      )}</div>`
    );
  }



}

function saveDownloads(quit) {
  var downloadedCourses = [];
  var $downloads = $(
    ".ui.downloads.section .ui.courses.items .ui.course.item"
  ).slice(0, 50);
  if ($downloads.length) {
    $downloads.each(function(index, elem) {
      $elem = $(elem);
      if ($elem.find(".progress.active").length) {
        var individualProgress = $elem
          .find(".download-status .individual.progress")
          .attr("data-percent");
        var combinedProgress = $elem
          .find(".download-status .combined.progress")
          .attr("data-percent");
        var completed = false;
      } else {
        var individualProgress = 0;
        var combinedProgress = 0;
        var completed = true;
      }
      var course = {
        id: $elem.attr("course-id"),
        url: $elem.attr("course-url"),
        title: $elem.find(".coursename").text(),
        image: $elem.find(".image img").attr("src"),
        individualProgress: individualProgress,
        combinedProgress: combinedProgress,
        completed: completed,
        progressStatus: $elem.find(".download-status .label").text()
      };
      downloadedCourses.push(course);
    });
    settings.set("downloadedCourses", downloadedCourses);
  }
  if (quit) {
    electron.ipcRenderer.send("quitApp");
  }
}

function loadDownloads() {
  if ($(".ui.downloads.section .ui.courses.items .ui.course.item").length) {
    return;
  }
  if ((downloadedCourses = settings.get("downloadedCourses"))) {
    downloadedCourses.forEach(function(course) {
      $course = $(`<div class="ui course item" course-id="${
        course.id
      }" course-url="${course.url}">
                  <div class="ui tiny label download-quality grey"></div>
                  <div class="ui tiny grey label download-speed"><span class="value">0</span> KB/s</div>
                    <div class="ui tiny image">
                      <img src="${course.image}">
                    </div>
                    <div class="content">
                      <span class="coursename">${course.title}</span>

                    <div class="ui tiny icon green download-success message">
                           <i class="check icon"></i>
                            <div class="content">
                              <div class="headers">
                                 ${translate("Download Completed")}
                               </div>
                               <p>${translate("Click to dismiss")}</p>
                             </div>
                      </div>

                    <div class="ui tiny icon  red download-error message">
                           <i class="power icon"></i>
                            <div class="content">
                              <div class="headers">
                                 ${translate("Download Failed")}
                               </div>
                               <p>${translate("Click to retry")}</p>
                             </div>
                      </div>

                      <div class="extra download-status">
                        ${downloadTemplate}
                      </div>

                    </div>
                  </div>
          `);
      $(".ui.downloads.section .ui.courses.items").append($course);
      if (!course.completed) {
        $course
          .find(".individual.progress")
          .progress({
            percent: course.individualProgress
          })
          .show();
        $course
          .find(".combined.progress")
          .progress({
            percent: course.combinedProgress
          })
          .show();
        $course.find(".download-status .label").html(course.progressStatus);
        $course.css("padding-bottom", "25px");
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
    url: `https://${subDomain}.udemy.com/api-2.0/users/me/subscribed-courses?page_size=50&page=1&fields[user]=job_title&search=${keyword}`,
    beforeSend: function() {
      $(".ui.dashboard .courses.dimmer").addClass("active");
    },
    headers: headers,
    success: function(response) {
      handleResponse(response, keyword);
    }
  });
}

function loadDefaults() {
  settings.set("download", {
    enableDownloadStartEnd: false,
    skipAttachments: false,
    skipSubtitles: false,
    autoRetry: false,
    downloadStart: false,
    downloadEnd: false,
    videoQuality: false,
    path: false
  });

  settings.set("general", {
    language: false
  });
}

if (!settings.get("general")) {
  loadDefaults();
}

function askforSubtile(availableSubs, initDownload, $course, coursedata) {
  var $subtitleModal = $(".ui.subtitle.modal");
  var $subtitleDropdown = $subtitleModal.find(".ui.dropdown");
  var subtitleLanguages = [];
  for (var key in availableSubs) {
    subtitleLanguages.push({
      name: `<b>${key}</b> <i>${availableSubs[key]} Lectures</i>`,
      value: key
    });
  }
  $subtitleModal.modal({ closable: false }).modal("show");
  $subtitleDropdown.dropdown({
    values: subtitleLanguages,
    onChange: function(subtitle) {
      $subtitleModal.modal("hide");
      $subtitleDropdown.dropdown({ values: [] });
      initDownload($course, coursedata, subtitle);
    }
  });
}

function loginWithUdemy() {
  if (
    $(".ui.login .form")
      .find('input[name="business"]')
      .is(":checked")
  ) {
    if (!$subDomain.val()) {
      prompt.alert("Type Business Name");
      return;
    }
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
    function(request, callback) {
      if (request.requestHeaders.Authorization) {
        settings.set(
          "access_token",
          request.requestHeaders.Authorization.split(" ")[1]
        );
        settings.set("subdomain", new URL(request.url).hostname.split(".")[0]);
        udemyLoginWindow.destroy();
        session.defaultSession.clearStorageData();
        session.defaultSession.webRequest.onBeforeSendHeaders(
          { urls: ["*://*.udemy.com/*"] },
          function(request, callback) {
            callback({ requestHeaders: request.requestHeaders });
          }
        );
        checkLogin();
      }
      callback({ requestHeaders: request.requestHeaders });
    }
  );
  if (
    $(".ui.login .form")
      .find('input[name="business"]')
      .is(":checked") &&
    $subDomain.val()
  ) {
    udemyLoginWindow.loadURL(`https://${$subDomain.val()}.udemy.com`);
  } else {
    udemyLoginWindow.loadURL("https://www.udemy.com/join/login-popup");
  }
}

function checkLogin() {
  if (settings.get("access_token")) {
    $(".ui.login.grid").slideUp("fast");
    $(".ui.dashboard")
      .fadeIn("fast")
      .css("display", "flex");
    headers = { Authorization: `Bearer ${settings.get("access_token")}` };
    $.ajax({
      type: "GET",
      url: `https://${settings.get(
        "subdomain"
      )}.udemy.com/api-2.0/users/me/subscribed-courses?page_size=50`,
      beforeSend: function() {
        $(".ui.dashboard .courses.dimmer").addClass("active");
      },
      headers: headers,
      success: function(response) {
        handleResponse(response);
      },
      error: function(response) {
        if (response.status == 403) {
          settings.set("access_token", false);
        }
        resetToLogin();
      }
    });
  }
}

function loginWithAccessToken() {
  if (
    $(".ui.login .form")
      .find('input[name="business"]')
      .is(":checked")
  ) {
    if (!$subDomain.val()) {
      prompt.alert("Type Business Name");
      return;
    }
  }
  prompt.prompt("Access Token", function(access_token) {
    if (access_token) {
      settings.set("access_token", access_token);
      settings.set("subdomain", $subDomain.val());
      checkLogin();
    }
  });
}

function resetToLogin() {
  $(".ui.dimmer").removeClass("active");
  $(".ui.dashboard .courses.items").empty();
  $(".content .ui.section").hide();
  $(".content .ui.courses.section").show();
  $(".sidebar")
    .find(".active")
    .removeClass("active red");
  $(".sidebar")
    .find(".courses-sidebar")
    .addClass("active red");
  $(".ui.login.grid").slideDown("fast");
  $(".ui.dashboard").fadeOut("fast");
}
