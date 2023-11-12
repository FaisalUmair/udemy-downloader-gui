"use strict";

const {shell, remote, ipcRenderer} = require("electron");
const {dialog, BrowserWindow} = remote;
const axios = require("axios");
const fs = require("fs");

const prompt = require("dialogs")({});
const mkdirp = require("mkdirp");

const sanitize = require("sanitize-filename");
const vtt2srt = require("node-vtt-to-srt");
const Downloader = require("mt-files-downloader");
const https = require("https");
const cookie = require("cookie");

const pageSize = 25;
const msgDRMProtected = translate("Contains DRM protection and cannot be downloaded");
const ajaxTimeout = 40000; // 40 segundos

var loggers = [];
var headersAuth;
var repoAccount = "heliomarpm";

var $divSubDomain = $(".ui.login #divsubdomain");
var $subDomain = $(".ui.login #subdomain");
// require('auto_authenticator.js');

const downloadTemplate = `
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

ipcRenderer.on("saveDownloads", function () {
	saveDownloads(true);
});

// external browser
// $(document).on('click', 'a[href^="http"]', (event) => {
$(document).on("click", ".how-get-token", (event) => {
	event.preventDefault();
	shell.openExternal(event.target.href);
});

$(".ui.dropdown").dropdown();

$(document).ajaxError(function (event, request) {
	$(".dimmer").removeClass("active");
});

$(".ui.login #business").change(function () {
	if ($(this).is(":checked")) {
		$subDomain.val(Settings.subDomain());
		$divSubDomain.show();
	} else {
		$subDomain.val(null);
		$divSubDomain.hide();
	}
});

$(".ui.dashboard .content").on("click", ".open-in-browser", function () {
	const link = `https://${Settings.subDomain()}.udemy.com${$(this).parents(".course.item").attr("course-url")}`;
	console.log("open", link);
	shell.openExternal(link);
});

$(".ui.dashboard .content").on("click", ".open-dir", function () {
	const pathDownloaded = $(this).parents(".course.item").find('input[name="path-downloaded"]').val();
	shell.openPath(pathDownloaded);
});

$(".ui.dashboard .content").on("click", ".dismiss-download", function () {
	const courseId = $(this).parents(".course.item").attr("course-id");
	removeCurseDownloads(courseId);
});

$(".ui.dashboard .content").on("click", ".load-more.button", function () {
	var $this = $(this);
	var $courses = $this.prev(".courses.items");
	const url = $this.data("url");
	console.log("loadMore", url);

	activateBusy(true);
	axios({
		timeout: ajaxTimeout,
		type: "GET",
		url,
		headers: headersAuth,
	})
		.then((response) => {
			const resp = response.data;
			// console.log("loadMore done", response);

			$.each(resp.results, function (index, course) {
				htmlCourseCard(course).appendTo($courses);
			});
			if (!resp.next) {
				$this.remove();
			} else {
				$this.data("url", resp.next);
			}
		})
		.catch((error) => {
			const statusCode = error.response ? error.response.status : 0;
			appendLog(`loadMore_Error: ${error.code}(${statusCode})`, error.message);
		})
		.finally(() => {
			activateBusy(false);
		});
});

$(".ui.dashboard .content").on("click", ".check-updates", function () {
	checkUpdate("heliomarpm");
});

$(".ui.dashboard .content").on("click", ".check-updates-original", function () {
	checkUpdate("FaisalUmair");
});

$(".ui.dashboard .content").on("click", ".old-version-mac", function () {
	shell.openExternal("https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.8.2/Udeler-1.8.2-mac.dmg");
});

$(".ui.dashboard .content").on("click", ".old-version-linux", function () {
	shell.openExternal("https://github.com/FaisalUmair/udemy-downloader-gui/releases/download/v1.8.2/Udeler-1.8.2-linux-x86_x64.AppImage");
});

$(".download-update.button").click(function () {
	shell.openExternal(`https://github.com/${repoAccount}/udemy-downloader-gui/releases/latest`);
});

$(".ui.dashboard .content .courses.section .search.form").submit(function (e) {
	e.preventDefault();
	var keyword = $(e.target).find("input").val();
	search(keyword);
});

$(".ui.dashboard .content").on("click", ".download-success, .course-encrypted", function () {
	$(this).hide();
	$(this).parents(".course").find(".download-status").show();
});

$(".ui.dashboard .content").on("click", ".download.button, .download-error", function (e) {
	e.stopImmediatePropagation();
	var $course = $(this).parents(".course");
	downloadButtonClick($course);
});

$(".ui.dashboard .content").on("click", "#clear_logger", function (e) {
	clearLogArea();
});
$(".ui.dashboard .content").on("click", "#save_logger", function (e) {
	saveLogFile();
});

function checkUpdate(account, noAlert = false) {
	$(".ui.dashboard .about.dimmer").addClass("active");
	$.getJSON(`https://api.github.com/repos/${account}/udemy-downloader-gui/releases/latest`, function (response) {
		$(".ui.dashboard .about.dimmer").removeClass("active");
		if (response.tag_name != `v${appVersion}`) {
			repoAccount = account;
			$(".ui.update-available.modal").modal("show");
		} else {
			if (noAlert == false) {
				prompt.alert(translate("No updates available"));
			}
		}
	});
}

function activateBusy(active) {
	if (active) {
		$(".ui.dashboard .courses.dimmer").addClass("active");
	} else {
		$(".ui.dashboard .courses.dimmer").removeClass("active");
	}
}

function htmlCourseCard(course, downloadSection = false) {
	if (!course.completed) {
		course.completed = false;
	}
	course.infoDownloaded = "";
	course.encryptedVideos = 0;
	course.pathDownloaded = "";

	const history = getDownloadHistory(course.id);
	if (history) {
		course.infoDownloaded = translate(history.completed ? "Download completed on" : "Download started since") + " " + history.date;
		course.completed = history.completed ? true : course.completed;
		course.encryptedVideos = history.encryptedVideos ?? 0;
		course.selectedSubtitle = history.selectedSubtitle ?? "";
		course.pathDownloaded = history.pathDownloaded ?? "";
	}

	// Se o caminho não existir, obtenha o caminho de configurações de download para o título do curso
	if (!fs.existsSync(course.pathDownloaded)) course.pathDownloaded = Settings.downloadDirectory(sanitize(course.title));

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
        <img src="${course.image ?? course.image_240x135}" class="course-image border-radius" />
        ${downloadSection ? tagDismiss : ""}
        <div class="tooltip">${course.encryptedVideos == 0 ? "" : msgDRMProtected}</div>
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
              <h4>${msgDRMProtected}</h4>
            </div>
            <p>${translate("Click to dismiss")}</p>
          </div>
        </div>

        <div class="extra download-status">
          ${downloadTemplate}
        </div>
        <!-- <div style='margin-top:15px'><span class="lecture-name"></span></div> -->

      </div>

    </div>`);

	if (!downloadSection) {
		if (course.completed) {
			resetCourse($course, $course.find(".download-success"));
		} else if (course.encryptedVideos > 0) {
			resetCourse($course, $course.find(".course-encrypted"));
		} else {
			$course.find(".info-downloaded").html(course.infoDownloaded).show();
		}
	} else {
		if (course.completed) {
			$course
				.find(".info-downloaded")
				.html("<span style='color: #46C855'>" + course.infoDownloaded + "</span>")
				.show();
		} else {
			$course.find(".individual.progress").progress({percent: course.individualProgress}).show();
			$course.find(".combined.progress").progress({percent: course.combinedProgress}).show();
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
		$course.find(".icon-encrypted").show();
		$course.find(".ui.tiny.image .tooltip").show();
		$course.find(".ui.tiny.image").addClass("wrapper");
	}

	if (!fs.existsSync(course.pathDownloaded)) {
		$course.find(".open-dir.button").hide();
	}

	return $course;
}

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

	let downFiles = Settings.download().downFiles ?? Settings.downloadType.LecturesAndAttachments;
	// var skipAttachments = Settings.download().skipAttachments;
	let skipSubtitles = Settings.download().skipSubtitles;
	let defaultSubtitle = subtitle ? subtitle : Settings.download().defaultSubtitle;

	// clique do botao iniciar download
	const url = `https://${Settings.subDomain()}.udemy.com/api-2.0/courses/${courseid}/cached-subscriber-curriculum-items?page_size=10000`;
	console.log("downloadButtonClick", url);

	$(".ui.dashboard .course.dimmer").addClass("active");
	axios({
		timeout: ajaxTimeout,
		type: "GET",
		url,
		headers: headersAuth,
		// beforeSend: function () {
		// 	$(".ui.dashboard .course.dimmer").addClass("active");
		// },
	})
		.then((response) => {
			const resp = response.data;

			console.log("carregando curso p/ download");

			// $(".ui.dashboard .course.dimmer").removeClass("active");
			$course.find(".download.button").addClass("disabled");
			$course.css("padding-bottom", "25px");
			$course.find(".ui.progress").show();

			var coursedata = [];
			coursedata["id"] = courseid;
			coursedata["chapters"] = [];
			coursedata["name"] = $course.find(".coursename").text();
			coursedata["totallectures"] = 0;
			coursedata["encryptedVideos"] = 0;
			coursedata["errorCount"] = 0;

			var chapterindex = -1;
			var lectureindex = -1;
			var remaining = resp.count;
			var availableSubs = [];

			if (resp.results[0]._class == "lecture") {
				chapterindex++;
				lectureindex = 0;
				coursedata["chapters"][chapterindex] = [];
				coursedata["chapters"][chapterindex]["name"] = "Chapter 1";
				coursedata["chapters"][chapterindex]["lectures"] = [];
				remaining--;
			}

			$.each(resp.results, function (i, v) {
				if (v._class.toLowerCase() == "chapter") {
					chapterindex++;
					lectureindex = 0;
					coursedata["chapters"][chapterindex] = [];
					coursedata["chapters"][chapterindex]["name"] = v.title;
					coursedata["chapters"][chapterindex]["lectures"] = [];
					remaining--;
				} else if (
					v._class.toLowerCase() == "lecture" &&
					(v.asset.asset_type.toLowerCase() == "video" ||
						v.asset.asset_type.toLowerCase() == "article" ||
						v.asset.asset_type.toLowerCase() == "file" ||
						v.asset.asset_type.toLowerCase() == "e-book")
				) {
					if (v.asset.asset_type.toLowerCase() != "video" && downFiles == Settings.downloadType.OnlyLectures) {
						//skipAttachments) {
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
						const url = `https://${Settings.subDomain()}.udemy.com/api-2.0/users/me/subscribed-courses/${courseid}/lectures/${
							v.id
						}?fields[lecture]=asset,supplementary_assets&fields[asset]=stream_urls,download_urls,captions,title,filename,data,body,media_sources,media_license_token`;
						console.log("getLecture", url);

						axios({
							timeout: ajaxTimeout,
							type: "GET",
							url,
							headers: headersAuth,
						})
							.then((response) => {
								const resp = response.data;
								console.log("carregando aula");

								var src="";
                                var videoQuality = "";
								var type="";

								if (v.asset.asset_type.toLowerCase() == "article") {
									if (resp.asset.data) {
										src = resp.asset.data.body;
									} else {
										src = resp.asset.body;
									}
									videoQuality = v.asset.asset_type;
									type = "Article";
								} else if (v.asset.asset_type.toLowerCase() == "file" || v.asset.asset_type.toLowerCase() == "e-book") {
									src = resp.asset.download_urls[v.asset.asset_type][0].file;
									videoQuality = v.asset.asset_type;
									type = "File";
								} else {
									var qualities = [];
									var qualitySrcMap = {};

									const medias = resp.asset.stream_urls?.Video ?? resp.asset.media_sources;
									medias.forEach(function (val) {
										if (val.type != "application/dash+xml") {
											if (val.label.toLowerCase() != "auto") {
												qualities.push(val.label);
											}
											qualitySrcMap[val.label] = val.file ?? val.src;
										}
									});

									const lowest = Math.min(...qualities);
									const highest = Math.max(...qualities);

									// if (qualities.length == 0 && Settings.download().videoQuality == "Highest")
									//   qualities.push("highest");
									videoQuality = (qualities.length == 0 ? "Auto" : Settings.download().videoQuality ?? "Auto").toString();
									type = "Video";
									src = medias[0].src ?? medias[0].file;

									switch (videoQuality.toLowerCase()) {
										case "auto":
											videoQuality = medias[0].label;
											break;
										// case "highest":
										//   src = qualitySrcMap[highest];
										//   videoQuality = highest;
										//   break;
										case "lowest":
											src = qualitySrcMap[lowest];
											videoQuality = lowest;
											break;
										case "highest":
											// has stream use it otherwise user highest quality
											if (qualitySrcMap["Auto"]) {
												src = qualitySrcMap["Auto"];
											} else {
												src = qualitySrcMap[highest];
												videoQuality = highest;
											}
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
									type: type,
								};

								if (!skipSubtitles && resp.asset.captions.length) {
									coursedata["chapters"][chapterindex]["lectures"][lectureindex].caption = [];

									resp.asset.captions.forEach(function (caption) {
										caption.video_label in availableSubs
											? (availableSubs[caption.video_label] = availableSubs[caption.video_label] + 1)
											: (availableSubs[caption.video_label] = 1);

										coursedata["chapters"][chapterindex]["lectures"][lectureindex].caption[caption.video_label] =
											caption.url;
									});
								}
								console.log("carregando aula coursedata", coursedata);

								if (resp.supplementary_assets.length && downFiles != Settings.downloadType.OnlyLectures) {
									//!skipAttachments) {
									coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"] = [];
									var supplementary_assets_remaining = resp.supplementary_assets.length;

									$.each(resp.supplementary_assets, function (a, b) {
										const url = `https://${Settings.subDomain()}.udemy.com/api-2.0/users/me/subscribed-courses/${courseid}/lectures/${
											v.id
										}/supplementary-assets/${b.id}?fields[asset]=download_urls,external_url,asset_type`;
										console.log("getLecture&Attachments", url);

										axios({
											timeout: ajaxTimeout,
											type: "GET",
											url,
											headers: headersAuth,
										})
											.then((response) => {
												const resp = response.data;

												console.log("carregando anexos");
												if (resp.download_urls) {
													coursedata["chapters"][chapterindex]["lectures"][lectureindex][
														"supplementary_assets"
													].push({
														src: resp.download_urls[resp.asset_type][0].file,
														name: b.title,
														quality: "Attachment",
														type: "File",
													});
												} else {
													coursedata["chapters"][chapterindex]["lectures"][lectureindex][
														"supplementary_assets"
													].push({
														src: `<script type="text/javascript">window.location = "${resp.external_url}";</script>`,
														name: b.title,
														quality: "Attachment",
														type: "Url",
													});
												}
												supplementary_assets_remaining--;
												if (!supplementary_assets_remaining) {
													remaining--;
													coursedata["totallectures"] += 1;

													if (!remaining) {
														if (Object.keys(availableSubs).length) {
															askForSubtitle(
																availableSubs,
																initDownload,
																$course,
																coursedata,
																defaultSubtitle
															);
														} else {
															initDownload($course, coursedata);
														}
													}
												}
											})
											.catch((error) => {
												const statusCode = error.response ? error.response.status : 0;
												appendLog(`getLectureAndAttachments_Error: ${error.code}(${statusCode})`, error.message);
												resetCourse($course, $course.find(".download-error"), false, coursedata);
											});
									});
								} else {
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
							})
							.catch((error) => {
								const statusCode = error.response ? error.response.status : 0;
								appendLog(`getLecture_Error: ${error.code}(${statusCode})`, error.message);
								resetCourse($course, $course.find(".download-error"), false, coursedata);
							});
					}

					getLecture(v.title, chapterindex, lectureindex);
					lectureindex++;
				} else if (downFiles != Settings.downloadType.OnlyLectures) {
					//(!skipAttachments) {
					const srcUrl = `https://${Settings.subDomain()}.udemy.com${$course.attr("course-url")}t/${v._class}/${v.id}`;

                    // Adiciona um chapter default, para cursos que tem apenas quiz
					if (coursedata["chapters"].length === 0) {
						chapterindex++;
						lectureindex = 0;
						coursedata["chapters"][chapterindex] = [];
						coursedata["chapters"][chapterindex]["name"] = "Chapter 0";
						coursedata["chapters"][chapterindex]["lectures"] = [];
                    }

					coursedata["chapters"][chapterindex]["lectures"][lectureindex] = {
						src: `<script type="text/javascript">window.location = "${srcUrl}";</script>`,
						name: v.title,
						quality: "Attachment",
						type: "Url",
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
		})
		.catch((error) => {
			$(".ui.dashboard .course.dimmer").removeClass("active");
			var msgError;
			const statusCode = error.response ? error.response.status : 0;
			switch (statusCode) {
				case 403:
					msgError = translate("You do not have permission to access this course");
					prompt.alert(msgError);
					break;
				case 504:
					msgError = "Gateway timeout";
					break;
				default:
					msgError = error.message;
					break;
			}

			appendLog(`download_Error: ${error.code}(${statusCode})`, msgError);
			$course.find(".download.button").removeClass("disabled");
			$course.find(".ui.progress").hide();
		})
		.finally(() => {
			$(".ui.dashboard .course.dimmer").removeClass("active");
		});
}

function initDownload($course, coursedata, subTitle = "") {
	var $clone = $course.clone();
	var subtitle = (Array.isArray(subTitle) ? subTitle[0] : subTitle).split("|");
	var $downloads = $(".ui.downloads.section .ui.courses.items");
	var $courses = $(".ui.courses.section .ui.courses.items");

	$course.find('input[name="selectedSubtitle"]').val(subtitle);
	if ($course.parents(".courses.section").length) {
		let $downloadItem = $downloads.find("[course-id=" + $course.attr("course-id") + "]");
		if ($downloadItem.length) {
			$downloadItem.replaceWith($clone);
		} else {
			$downloads.prepend($clone);
		}
	} else {
		var $courseItem = $courses.find("[course-id=" + $course.attr("course-id") + "]");
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
		144: "purple",
		240: "orange",
		360: "blue",
		480: "teal",
		720: "olive",
		1080: "green",
		Highest: "green",
		auto: "red",
		Attachment: "pink",
		Subtitle: "black",
	};
	var currentLecture = 0;
	coursedata["chapters"].forEach(function (lecture, chapterindex) {
		lecture["lectures"].forEach(function (x, lectureindex) {
			currentLecture++;
			lectureChaperMap[currentLecture] = {
				chapterindex: chapterindex,
				lectureindex: lectureindex,
			};
		});
	});

	var course_name = sanitize(coursedata["name"]); //, { replacement: (s) => "? ".indexOf(s) > -1 ? "" : "-", }).trim();
	var totallectures = coursedata["totallectures"];
	var $progressElemCombined = $course.find(".combined.progress");
	var $progressElemIndividual = $course.find(".individual.progress");
	var download_directory = Settings.downloadDirectory();
	// var $lecture_name = $course.find(".lecture-name");
	var $download_speed = $course.find(".download-speed");
	var $download_speed_value = $download_speed.find(".value");
	var $download_speed_unit = $download_speed.find(".download-unit");
	var $download_quality = $course.find(".download-quality");
	var downloaded = 0;
	var downloadStart = Settings.download().downloadStart;
	var downloadEnd = Settings.download().downloadEnd;
	var enableDownloadStartEnd = Settings.download().enableDownloadStartEnd;

	$course.css("cssText", "padding-top: 35px !important").css("padding-bottom", "25px");

	$course.find('input[name="path-downloaded"]').val(`${download_directory}/${course_name}`);
	$course.find(".open-dir.button").show();

	$pauseButton.click(function () {
		stopDownload();
	});

	$resumeButton.click(function () {
		downloader._downloads[downloader._downloads.length - 1].resume();
		$resumeButton.addClass("disabled");
		$pauseButton.removeClass("disabled");
	});

	var toDownload = 0;
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

		toDownload = downloadEnd - downloadStart + 1;
		downloadChapter(lectureChaperMap[downloadStart].chapterindex, lectureChaperMap[downloadStart].lectureindex);
	} else {
		toDownload = totallectures;
		downloadChapter(0, 0);
	}

	$progressElemCombined.progress({
		total: toDownload,
		text: {
			active: `${translate("Downloaded")} {value} ${translate("out of")} {total} ${translate("items")}`,
		},
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
		try {
			const num_lectures = coursedata["chapters"][chapterindex]["lectures"].length;
			const seqName = getSequenceName(
				chapterindex + 1,
				coursedata["chapters"].length,
				coursedata["chapters"][chapterindex]["name"].trim(),
				". ",
				download_directory + "/" + course_name
			);

			mkdirp(seqName.fullPath).then(() => downloadLecture(chapterindex, lectureindex, num_lectures, seqName.name));
		} catch (err) {
			appendLog("downloadChapter_Error:", err.message);
			//captureException(err);
			dialog.showErrorBox("downloadChapter_Error", err.message);

			resetCourse($course, $course.find(".download-error"), false, coursedata);
		}
	}

	function downloadLecture(chapterindex, lectureindex, num_lectures, chapter_name) {
		try {
			if (downloaded == toDownload) {
				resetCourse($course, $course.find(".download-success"));
				sendNotification(
					download_directory + "/" + course_name,
					course_name,
					$course.find(".ui.tiny.image").find(".course-image").attr("src")
				);
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
					maxRetries: 3, // Default: 5
					retryInterval: 3000, // Default: 2000
				});

				// Set download options
				dl.setOptions({
					threadsCount: 5, // Default: 2, Set the total number of download threads
					timeout: 5000, // Default: 5000, If no data is received, the download times out (milliseconds)
					range: "0-100", // Default: 0-100, Control the part of file that needs to be downloaded.
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

							if (dl.status === -1 && dl.stats.total.size == 0 && fs.existsSync(dl.filePath)) {
								dl.emit("end");
								clearInterval(timer);
							} else if (dl.status === -1) {
								axios({
									timeout: ajaxTimeout,
									type: "HEAD",
									url: dl.url,
								})
									.then(() => {
										resetCourse(
											$course,
											$course.find(".download-error"),
											Settings.download().autoRetry,
											coursedata,
											subtitle
										);
									})
									.catch((error) => {
										const statusCode = error.response ? error.response.status : 0;
										appendLog(`downloadLeacture_Error: ${error.code}(${statusCode})`, error.message);

										try {
											if (statusCode == 401 || statusCode == 403) {
												fs.unlinkSync(dl.filePath);
											}
										} finally {
											resetCourse(
												$course,
												$course.find(".download-error"),
												Settings.download().autoRetry,
												coursedata,
												subtitle
											);
										}
									});

								clearInterval(timer);
							}
							break;

						case 2:
						case -3:
							break;
						default:
							$download_speed_value.html(0);
					}
				}, 1000);

				dl.on("error", function (dl) {
					if (hasDRMProtection(dl)) {
						dl.emit("end");
					} else {
						appendLog("errorDownload", dl.error.message);
					}
				});

				dl.on("start", function () {
					let file = dl.filePath.split("/").slice(-2).join("/");

					console.log("startDownload", file);
					$pauseButton.removeClass("disabled");
				});

				dl.on("stop", function () {
					console.warn("stopDownload");
				});

				dl.on("end", function () {
					// console.log("Download Finalizado", dl);
					if (typeVideo && hasDRMProtection(dl)) {
						$course.find('input[name="encryptedvideos"]').val(++coursedata.encryptedVideos);

						appendLog(`DRM Protected::${coursedata.name}`, dl.filePath, false);
						fs.unlink(dl.filePath + ".mtd", (err) => {
							if (err) {
								console.error("dl.on(end)__fs.unlink", err.message);
							}
						});

						if (!Settings.download().continueDonwloadingEncrypted) {
							dl.destroy();
							stopDownload(true);
							clearInterval(timer);
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
						getSequenceName(lectureindex + 1, num_lectures, attachmentName + ".html", `.${index + 1} `, wfDir).fullPath,
						attachment["src"],
						function () {
							index++;
							if (index == total_assets) {
								$progressElemCombined.progress("increment");
								downloaded++;
								downloadLecture(chapterindex, ++lectureindex, num_lectures, chapter_name);
							} else {
								downloadAttachments(index, total_assets);
							}
						}
					);
				} else {
					//Download anexos
					let fileExtension = attachment.src.split("/").pop().split("?").shift().split(".").pop();
					fileExtension = attachment.name.split(".").pop() == fileExtension ? "" : "." + fileExtension;

					const seqName = getSequenceName(
						lectureindex + 1,
						num_lectures,
						attachmentName + fileExtension,
						`.${index + 1} `,
						`${download_directory}/${course_name}/${chapter_name}`
					);

					if (fs.existsSync(seqName.fullPath + ".mtd") && !fs.statSync(seqName.fullPath + ".mtd").size) {
						fs.unlinkSync(seqName.fullPath + ".mtd");
					}

					if (fs.existsSync(seqName.fullPath + ".mtd")) {
						console.log("downloadAttachments: Reiniciando download", seqName.fullPath);
						var dl = downloader.resumeDownload(seqName.fullPath);
					} else if (fs.existsSync(seqName.fullPath)) {
						endDownload();
						return;
					} else {
						if (seqName.fullPath.includes(".mp4") || attachment["type"].toLowerCase() == "video")
							console.log("downloadAttachements: Iniciando download do Video", attachment["src"]);

						var dl = downloader.download(attachment["src"], seqName.fullPath);
					}

					dlStart(dl, attachment["type"].toLowerCase() == "video", endDownload);

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
				const attachment = coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"];

				if (attachment) {
					// order by name
					coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"].sort(dynamicSort("name"));

					var total_assets = attachment.length;
					var index = 0;
					downloadAttachments(index, total_assets);
				} else {
					$progressElemCombined.progress("increment");
					downloaded++;
					downloadLecture(chapterindex, ++lectureindex, num_lectures, chapter_name);
				}
			}

			function downloadSubtitle() {
				$progressElemIndividual.progress("reset");
				var lastClass = $download_quality.attr("class").split(" ").pop();
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

					fs.createReadStream(vttFile).pipe(vtt2srt()).pipe(finalSrt);
				});

				var caption = coursedata["chapters"][chapterindex]["lectures"][lectureindex]["caption"];
				var available = [];
				$.map(subtitle, function (el) {
					if (el in caption) {
						available.push(el);
					}
				});

				var download_this_sub = available[0] || Object.keys(caption)[0] || "";
				// Prefer non "[Auto]" subs (likely entered by the creator of the lecture.)
				if (available.length > 1) {
					for (let key in available) {
						if (available[key].indexOf("[Auto]") == -1 || available[key].indexOf(`[${translate("Auto")}]`) == -1) {
							download_this_sub = available[key];
							break;
						}
					}
				}

				// Per lecture: download maximum 1 of the language.
				https.get(
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

			// read url as string or ArrayBuffer
			async function getFile(url, binary) {
				var count = 0;

				// on error retry 3 times
				while (count < 3) {
					try {
						var i = await fetch(url);

						var t = i.status;

						if (t >= 200 && t < 300) {
							if (binary) return await i.arrayBuffer();

							return await i.text();
						} else console.log("getFile_Buffer", i.statusText);
					} catch (err) {
						appendLog("getFile_Error", err.message);
					}

					count++;
				}

				return null;
			}

			// read highest quality playlist
			async function getPlaylist(url) {
				var playlist = await getFile(url, false);

				if (!playlist) return [];

				var lines = playlist.trim().split("\n");
				var urlList = [];

				lines.forEach((line) => {
					if (line.toLowerCase().indexOf(".ts") > -1) urlList.push(line);
				});

				if (urlList.length == 0 && playlist.indexOf("m3u8") > 0) {
					var maximumQuality = 0;
					var maximumQualityPlaylistUrl;
					var getUrl = false;

					for (var line of lines) {
						if (getUrl) {
							maximumQualityPlaylistUrl = line;
							getUrl = false;
						}

						line = line.toUpperCase();

						if (line.indexOf("EXT-X-STREAM-INF") > -1 && line.indexOf("RESOLUTION") > -1) {
							try {
								var readQuality = parseInt(line.split("RESOLUTION=")[1].split("X")[1].split(",")[0]) || 0;

								if (readQuality > maximumQuality) {
									maximumQuality = readQuality;
									getUrl = true;
								}
							} catch (err) {
								appendLog("getPlaylist_Error", err.message);
								captureException(err);
							}
						}
					}

					if (maximumQuality > 0) {
						$download_quality.html(`${lectureQuality} ${maximumQuality}p`);
						return await getPlaylist(maximumQualityPlaylistUrl);
					}
				}

				return urlList;
			}

			$progressElemIndividual.progress("reset");

			var lectureQuality = coursedata["chapters"][chapterindex]["lectures"][lectureindex]["quality"];
			var lastClass = $download_quality.attr("class").split(" ").pop();

			$download_quality
				.html(lectureQuality + (lectureType == "video" && !isNaN(parseFloat(lectureQuality)) ? "p" : ""))
				.removeClass(lastClass)
				.addClass(qualityColorMap[lectureQuality] || "grey");

			if (lectureType == "article" || lectureType == "url") {
				const wfDir = `${download_directory}/${course_name}/${chapter_name}`;
				fs.writeFile(
					getSequenceName(lectureindex + 1, num_lectures, lectureName + ".html", ". ", wfDir).fullPath,
					coursedata["chapters"][chapterindex]["lectures"][lectureindex]["src"],
					function () {
						if (coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"]) {
							coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"].sort(
								dynamicSort("name")
							);
							var total_assets =
								coursedata["chapters"][chapterindex]["lectures"][lectureindex]["supplementary_assets"].length;
							var index = 0;
							downloadAttachments(index, total_assets);
						} else {
							$progressElemCombined.progress("increment");
							downloaded++;
							downloadLecture(chapterindex, ++lectureindex, num_lectures, chapter_name);
						}
					}
				);
			} else {
				const seqName = getSequenceName(
					lectureindex + 1,
					num_lectures,
					lectureName + (lectureType == "file" ? ".pdf" : ".mp4"),
					". ",
					`${download_directory}/${course_name}/${chapter_name}`
				);

				// $lecture_name.html(`${coursedata["chapters"][chapterindex].name}\\${coursedata["chapters"][chapterindex]["lectures"][lectureindex].name}`);
				const skipLecture = Settings.download().downFiles == Settings.downloadType.OnlyAttachments;

				// if not stream
				if (lectureQuality != "Highest") {
					if (fs.existsSync(seqName.fullPath + ".mtd") && !fs.statSync(seqName.fullPath + ".mtd").size) {
						fs.unlinkSync(seqName.fullPath + ".mtd");
					}

					if (fs.existsSync(seqName.fullPath + ".mtd") && !skipLecture) {
						console.log("downloadLecture: Reiniciando download", seqName.fullPath);
						var dl = downloader.resumeDownload(seqName.fullPath);
					} else if (fs.existsSync(seqName.fullPath) || skipLecture) {
						endDownloadAttachment();
						return;
					} else {
						console.log(
							"downloadLecture: Iniciando download do Video ",
							coursedata["chapters"][chapterindex]["lectures"][lectureindex]["src"]
						);
						var dl = downloader.download(
							coursedata["chapters"][chapterindex]["lectures"][lectureindex]["src"],
							seqName.fullPath
						);
					}

					dlStart(dl, lectureType == "video", endDownloadAttachment);
				} else {
					if (fs.existsSync(seqName.fullPath + ".mtd")) {
						fs.unlinkSync(seqName.fullPath + ".mtd");
					} else if (fs.existsSync(seqName.fullPath) || skipLecture) {
						endDownloadAttachment();
						return;
					}

					getPlaylist(coursedata["chapters"][chapterindex]["lectures"][lectureindex]["src"]).then(async (list) => {
						if (list.length > 0) {
							var result = [list.length];

							var count = 0;
							$progressElemIndividual.progress("reset");

							for (var a of list) {
								var startTime = performance.now();
								var response = await getFile(a, true);
								var endTime = performance.now();
								var timeDiff = (endTime - startTime) / 1000.0;

								var download_speed_and_unit = getDownloadSpeed(parseInt(response.byteLength / 1024 / timeDiff) || 0);
								$download_speed_value.html(download_speed_and_unit.value);
								$download_speed_unit.html(download_speed_and_unit.unit);
								result[count] = response;
								count++;
								$progressElemIndividual.progress("set percent", parseInt((count / list.length) * 100));
							}

							var blob = new Blob(result, {
								type: "application/octet-binary",
							});
							var data = Buffer.from(await blob.arrayBuffer());
							fs.writeFileSync(seqName.fullPath, data);
							// fs.renameSync(seqName.fullPath + ".mtd", seqName.fullPath);
						}

						endDownloadAttachment();
						return;
					});
				}

				function endDownloadAttachment() {
					clearInterval(timer);
					if (coursedata["chapters"][chapterindex]["lectures"][lectureindex].caption) {
						downloadSubtitle();
					} else {
						checkAttachment();
					}
				}
			}
		} catch (err) {
			appendLog("downloadLecture_Error:", err.message);
			captureException(err);

			resetCourse($course, $course.find(".download-error"), false, coursedata);
		}
	}

	function hasDRMProtection(dl) {
		try {
			// return !dl.meta.headers["content-type"].includes("video");
			const encrypted = dl.url.includes("encrypted-files");
			if (encrypted) console.warn("Arquivo encriptado", dl);

			return encrypted;
		} catch (error) {
			return false;
		}
	}
}

function resetCourse($course, $elMessage, autoRetry, coursedata, subtitle) {
	if ($elMessage.hasClass("download-success")) {
		$course.attr("course-completed", true);
	} else {
		$course.attr("course-completed", "");

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

$(".logger-sidebar").click(function () {
	$(".content .ui.section").hide();
	$(".content .ui.logger.section").show();
	$(this).parent(".sidebar").find(".active").removeClass("active purple");
	$(this).addClass("active purple");

	clearBagdeLoggers();
});

$(".logout-sidebar").click(function () {
	prompt.confirm(translate("Confirm Log Out?"), function (ok) {
		if (ok) {
			$(".ui.logout.dimmer").addClass("active");
			saveDownloads(false);
			Settings.accessToken(null);
			resetToLogin();
		}
	});
});

$(".content .ui.about").on("click", 'a[href^="http"]', function (e) {
	e.preventDefault();
	shell.openExternal(this.href);
});

$(".ui.settings .form").submit((e) => {
	e.preventDefault();

	function findInput(inputName, attr = "") {
		return $(e.target).find(`input[name="${inputName}"]${attr}`);
	}

	const checkNewVersion = findInput("check-new-version")[0].checked ?? true;
	const autoStartDownload = findInput("auto-start-download")[0].checked ?? false;
	const continueDonwloadingEncrypted = findInput("continue-downloading-encrypted")[0].checked ?? false;
	const enableDownloadStartEnd = findInput("enabledownloadstartend")[0].checked ?? false;
	const downFiles = findInput("downloadFiles", ":checked").val() ?? Settings.downloadType.LecturesAndAttachments;
	const skipSubtitles = findInput("skipsubtitles")[0].checked ?? false;
	const autoRetry = findInput("autoretry")[0].checked ?? false;
	const downloadStart = parseInt(findInput("downloadstart").val() ?? 0);
	const downloadEnd = parseInt(findInput("downloadend").val() ?? 0);
	const videoQuality = findInput("videoquality").val() ?? "Auto";
	const downloadPath = findInput("downloadpath").val() ?? false;
	const language = findInput("language").val() ?? false;
	const defaultSubtitle = findInput("defaultSubtitle").val() ?? false;
	const seqZeroLeft = findInput("seq-zero-left")[0].checked ?? false;

	Settings.download({
		checkNewVersion,
		autoStartDownload,
		continueDonwloadingEncrypted,
		enableDownloadStartEnd,
		downFiles,
		skipSubtitles,
		autoRetry,
		downloadStart,
		downloadEnd,
		videoQuality,
		path: downloadPath,
		defaultSubtitle,
		seqZeroLeft,
	});

	Settings.general({
		language,
	});

	prompt.alert(translate("Settings Saved"));
});

var settingsForm = $(".ui.settings .form");

function loadSettings() {
	settingsForm.find('input[name="check-new-version"]').prop("checked", Settings.download().checkNewVersion ?? false);
	settingsForm.find('input[name="auto-start-download"]').prop("checked", Settings.download().autoStartDownload ?? false);
	settingsForm
		.find('input[name="continue-downloading-encrypted"]')
		.prop("checked", Settings.download().continueDonwloadingEncrypted ?? false);

	settingsForm.find('input[name="enabledownloadstartend"]').prop("checked", Settings.download().enableDownloadStartEnd ?? false);
	settingsForm
		.find('input[name="downloadstart"], input[name="downloadend"]')
		.prop("readonly", Settings.download().enableDownloadStartEnd ?? false);

	// REMOVER NAS FUTURAS VERSOES
	let downFiles;

	if (Settings.download().downFiles) {
		downFiles = Settings.download().downFiles;
	} else {
		let legadoSkipAttachment = Settings.download().skipAttachments ?? false;

		downFiles = legadoSkipAttachment ? Settings.downloadType.OnlyLectures : Settings.downloadType.LecturesAndAttachments;

		Settings.download().downFiles = downFiles;
	}

	settingsForm.find('input:radio[name="downloadFiles"]').filter(`[value="${downFiles}"]`).prop("checked", true);
	// settingsForm.find('input[name="skipattachments"]').prop("checked", Settings.download().skipAttachments ?? false);
	settingsForm.find('input[name="skipsubtitles"]').prop("checked", Settings.download().skipSubtitles ?? false);
	settingsForm.find('input[name="autoretry"]').prop("checked", Settings.download().autoRetry ?? false);
	settingsForm.find('input[name="seq-zero-left"]').prop("checked", Settings.download().seqZeroLeft ?? false);

	settingsForm.find('input[name="downloadpath"]').val(Settings.downloadDirectory());
	settingsForm.find('input[name="downloadstart"]').val(Settings.download().downloadStart || "");
	settingsForm.find('input[name="downloadend"]').val(Settings.download().downloadEnd || "");

	var videoQuality = Settings.download().videoQuality;
	settingsForm.find('input[name="videoquality"]').val(videoQuality || "");
	settingsForm
		.find('input[name="videoquality"]')
		.parent(".dropdown")
		.find(".default.text")
		.html(videoQuality || translate("Auto"));

	settingsForm.find('input[name="language"]').val(Settings.language || "");
	settingsForm
		.find('input[name="language"]')
		.parent(".dropdown")
		.find(".default.text")
		.html(Settings.language || "English");

	var defaultSubtitle = Settings.download().defaultSubtitle;
	settingsForm.find('input[name="defaultSubtitle"]').val(defaultSubtitle || "");
	settingsForm
		.find('input[name="defaultSubtitle"]')
		.parent(".dropdown")
		.find(".defaultSubtitle.text")
		.html(defaultSubtitle || "");
}

settingsForm.find('input[name="enabledownloadstartend"]').change(function () {
	settingsForm.find('input[name="downloadstart"], input[name="downloadend"]').prop("readonly", !this.checked);
});

function selectDownloadPath() {
	const path = dialog.showOpenDialogSync({
		properties: ["openDirectory"],
	});

	if (path && path[0]) {
		fs.access(path[0], fs.constants.R_OK && fs.constants.W_OK, function (err) {
			if (err) {
				prompt.alert(translate("Cannot select this folder"));
			} else {
				settingsForm.find('input[name="downloadpath"]').val(path[0]);
			}
		});
	}
}

function rendererCourse(response, keyword = "") {
	// console.log("rendererCourse", response);

	activateBusy(false);
	$(".ui.dashboard .ui.courses.section .disposable").remove();
	$(".ui.dashboard .ui.courses.section .ui.courses.items").empty();
	if (response.results.length) {
		$.each(response.results, function (index, course) {
			$(".ui.dashboard .ui.courses.section .ui.courses.items").append(htmlCourseCard(course));
		});
		if (response.next) {
			$(".ui.courses.section").append(
				`<button class="ui basic blue fluid load-more button disposable" data-url=${response.next}>
          ${translate("Load More")}
        </button>`
			);
		}
	} else {
		let msg = "";
		if (keyword.length === 0) {
			msg = getMsgChangeSearchMode();
			appendLog(translate("No Courses Found"), msg, false);
		}

		$(".ui.dashboard .ui.courses.section .ui.courses.items").append(
			`<div class="ui yellow message disposable">
        ${translate("No Courses Found")} <br/>
        ${translate("Remember, you will only be able to see the courses you are enrolled in")}
        ${msg}
      </div>`
		);
	}
}

/**
 * Returns a message for changing search mode based on account subscription status
 *
 * @return {string} Message for changing search mode
 */
function getMsgChangeSearchMode() {
	let message = "<p>";

	message += Settings.subscriber()
		? translate("This account has been identified with a subscription plan")
		: translate("This account was identified without a subscription plan");

	message += `<br/>${translate("If it's wrong, change the search mode and try again")}`;
	message += `<div class="ui fluid buttons"><button class='ui primary button change-search-mode' onclick='toggleSubscriber()'>${translate(
		"Change search mode"
	)}</button></div>`;
	message += "</p>";

	return message;
}

/**
 * Toggles the subscriber setting and clears the search field.
 */
function toggleSubscriber() {
	Settings.subscriber(!Settings.subscriber());
	search("");
}

function rendererDownloads() {
	const courseItems = $(".ui.downloads.section .ui.courses.items .ui.course.item");
	if (courseItems.length) {
		return;
	}

	const downloadedCourses = Settings.downloadedCourses();
	if (downloadedCourses) {
		downloadedCourses.forEach(function (course) {
			const $courseCard = htmlCourseCard(course, true);
			$(".ui.downloads.section .ui.courses.items").append($courseCard);

			if (!course.completed && Settings.download().autoStartDownload) {
				downloadButtonClick($courseCard, course.selectedSubtitle);
				$courseCard.find(".action.buttons").find(".pause.button").removeClass("disabled");
			}
		});
	}
}

function addDownloadHistory(courseId, completed = false, encryptedVideos = 0, selectedSubtitle = "", pathDownloaded = "") {
	var item = undefined;
	const items = getAllDownloadsHistory() ?? [];

	completed = Boolean(completed);

	if (items.length > 0) {
		item = items.find((x) => x.id == courseId);
	}

	if (item) {
		if (completed !== item.completed) {
			item.completed = completed;
			item.date = new Date(Date.now()).toLocaleDateString();
		}
		item.encryptedVideos = encryptedVideos;
		item.selectedSubtitle = selectedSubtitle;
		item.pathDownloaded = pathDownloaded;
	} else {
		item = {
			id: courseId,
			completed,
			date: new Date(Date.now()).toLocaleDateString(),
			encryptedVideos,
			selectedSubtitle,
			pathDownloaded,
		};

		items.push(item);
	}

	Settings.downloadHistory(items);
}

function getAllDownloadsHistory() {
	return Settings.downloadHistory();
}

function getDownloadHistory(courseId) {
	try {
		const items = getAllDownloadsHistory() ?? [];

		if (items.length > 0) {
			return items.find((x) => x.id == courseId);
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
			const $elem = $(elem);
			const inProgress = $elem.find(".progress.active").length;
			const individualProgress = inProgress ? $elem.find(".download-status .individual.progress").attr("data-percent") : 0;
			const combinedProgress = inProgress ? $elem.find(".download-status .combined.progress").attr("data-percent") : 0;
			const completed = inProgress ? false : Boolean($elem.attr("course-completed"));

			var course = {
				id: $elem.attr("course-id"),
				url: $elem.attr("course-url"),
				title: $elem.find(".coursename").text(),
				image: $elem.find(".image img").attr("src"),
				individualProgress: individualProgress > 100 ? 100 : individualProgress,
				combinedProgress: combinedProgress > 100 ? 100 : combinedProgress,
				completed,
				progressStatus: $elem.find(".download-status .label").text(),
				encryptedVideos: $elem.find('input[name="encryptedvideos"]').val(),
				selectedSubtitle: $elem.find('input[name="selectedSubtitle"]').val(),
				pathDownloaded: $elem.find('input[name="path-downloaded"]').val(),
			};

			downloadedCourses.push(course);
			addDownloadHistory(course.id, completed, course.encryptedVideos, course.selectedSubtitle, course.pathDownloaded);
		});

		Settings.downloadedCourses(downloadedCourses);
	}
	if (quit) {
		ipcRenderer.send("quitApp");
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

function clearLogArea() {
	loggers = [];
	$(".ui.logger.section .ui.list").html("");
	clearBagdeLoggers();
}

function appendLog(title, description, isError = true) {
	const log = {
		datetime: new Date().toLocaleString(),
		title,
		description,
	};

	loggers.unshift(log);

	$(".ui.logger.section .ui.list").prepend(
		`<div class="item">
      <div class="header">
        ${title}
      </div>
      <samp>${description}</samp>
    </div>`
	);

	incrementBadgeLoggers();

	if (isError) {
		console.error(`[${title}] ${description}`);
	} else {
		console.warn(`[${title}] ${description}`);
	}
}

function clearBagdeLoggers() {
	$("#badge-logger").text("0");
	$("#badge-logger").hide();
}

function incrementBadgeLoggers() {
	let qtd = $("#badge-logger").text();
	qtd = qtd.trim().length > 0 ? parseInt(qtd, 0) + 1 : 1;

	$("#badge-logger").text(qtd > 99 ? "99+" : qtd);
	$("#badge-logger").show();
}

function rendererLogger() {
	$(".ui.logger.section .ui.list").empty();
	loggers.forEach((item) => {
		$(".ui.logger.section .ui.list").append(
			`<div class="item">
        <div class="header">
          ${item.title}
        </div>
        ${item.description}
      </div>`
		);
	});
}

function search(keyword) {
	const subscriber = Settings.subscriber();
	const url = !subscriber
		? `https://${Settings.subDomain()}.udemy.com/api-2.0/users/me/subscribed-courses?page=1&page_size=30&ordering=title&fields[user]=job_title&page_size=${pageSize}&search=${keyword}`
		: `https://${Settings.subDomain()}.udemy.com/api-2.0/users/me/subscription-course-enrollments?page=1&page_size=30&ordering=title&fields[user]=job_title&page_size=${pageSize}&search=${keyword}`;

	console.log("search", url);

	activateBusy(true);
	axios({
		timeout: ajaxTimeout, // timeout to 5 seconds
		type: "GET",
		url,
		headers: headersAuth,
	})
		.then((response) => {
			console.log("search done");
			rendererCourse(response.data, keyword);
		})
		.catch((error) => {
			const statusCode = error.response ? error.response.status : 0;
			appendLog(`search_Error: ${error.code}(${statusCode})`, error.message);
		})
		.finally(() => {
			activateBusy(false);
		});
}

function askForSubtitle(availableSubs, initDownload, $course, coursedata, defaultSubtitle = "") {
	var $subtitleModal = $(".ui.subtitle.modal");
	var $subtitleDropdown = $subtitleModal.find(".ui.dropdown");
	var subtitleLanguages = [];
	var languages = [];
	var totals = [];
	var languageKeys = {};

	defaultSubtitle = defaultSubtitle
		.replace("[Auto]", "")
		.replace(`[${translate("Auto")}]`, "")
		.trim();

	for (var key in availableSubs) {
		const subtitle = key
			.replace("[Auto]", "")
			.replace(`[${translate("Auto")}]`, "")
			.trim();

		// default subtitle exists
		if (subtitle === defaultSubtitle) {
			initDownload($course, coursedata, key);
			return;
		}

		if (!(subtitle in totals)) {
			languages.push(subtitle);
			totals[subtitle] = 0;
			languageKeys[subtitle] = [];
		}

		totals[subtitle] += availableSubs[key];
		languageKeys[subtitle].push(key);
	}

	// only a subtitle
	if (languages.length == 1) {
		initDownload($course, coursedata, languageKeys[0]);
		return;
	} else if (languages.length == 0) {
		return;
	}

	for (var total in totals) {
		totals[total] = Math.min(coursedata["totallectures"], totals[total]);
	}

	languages.sort();
	for (var language of languages) {
		subtitleLanguages.push({
			name: `<b>${language}</b> <i>${totals[language]} ${translate("Lectures")}</i>`,
			value: languageKeys[language].join("|"),
		});
	}

	$subtitleModal.modal({closable: false}).modal("show");

	$subtitleDropdown.dropdown({
		values: subtitleLanguages,
		onChange: function (subtitle) {
			$subtitleModal.modal("hide");
			$subtitleDropdown.dropdown({values: []});
			initDownload($course, coursedata, subtitle);
		},
	});
}

function loginWithUdemy() {
	const $formLogin = $(".ui.login .form");

	if ($formLogin.find('input[name="business"]').is(":checked")) {
		if (!$subDomain.val()) {
			prompt.alert("Type Business Name");
			return;
		}
	} else {
		$subDomain.val(null);
	}

	var parent = remote.getCurrentWindow();
	var dimensions = parent.getSize();
	var session = remote.session;
	let udemyLoginWindow = new BrowserWindow({
		width: dimensions[0] - 100,
		height: dimensions[1] - 100,
		parent,
		modal: true,
	});

	session.defaultSession.webRequest.onBeforeSendHeaders({urls: ["*://*.udemy.com/*"]}, function (request, callback) {
		const token = request.requestHeaders.Authorization
			? request.requestHeaders.Authorization.split(" ")[1]
			: cookie.parse(request.requestHeaders.Cookie || "").access_token;

		if (token) {
			//const subscriber = $formLogin.find('input[name="subscriber"]').is(":checked");

			Settings.accessToken(token);
			Settings.subDomain(new URL(request.url).hostname.split(".")[0]);
			//Settings.subscriber(subscriber);

			udemyLoginWindow.destroy();
			session.defaultSession.clearStorageData();
			session.defaultSession.webRequest.onBeforeSendHeaders({urls: ["*://*.udemy.com/*"]}, function (request, callback) {
				callback({requestHeaders: request.requestHeaders});
			});
			checkLogin();
		}
		callback({requestHeaders: request.requestHeaders});
	});

	if ($subDomain.val()) {
		Settings.subDomain($subDomain.val());
		udemyLoginWindow.loadURL(`https://${Settings.subDomain()}.udemy.com`);
	} else {
		udemyLoginWindow.loadURL("https://www.udemy.com/join/login-popup");
	}
}

function checkLogin() {
	if (Settings.accessToken()) {
		$(".ui.login.grid").slideUp("fast");
		$(".ui.dashboard").fadeIn("fast").css("display", "flex");

		headersAuth = {Authorization: `Bearer ${Settings.accessToken()}`};

		let url = "https://www.udemy.com/api-2.0/contexts/me/?header=True";
		console.log("checkLogin", {url, headersAuth});

		axios({
			timeout: ajaxTimeout,
			type: "GET",
			url,
			headers: headersAuth,
		})
			.then((response) => {
				const resp = response.data;

				const subscriber = toBoolean(resp.header.user.enableLabsInPersonalPlan);
				Settings.subscriber(subscriber);
				url = !subscriber
					? `https://${Settings.subDomain()}.udemy.com/api-2.0/users/me/subscribed-courses?page_size=${pageSize}&page_size=30&ordering=-last_accessed`
					: `https://${Settings.subDomain()}.udemy.com/api-2.0/users/me/subscription-course-enrollments?page_size=${pageSize}&page_size=30&ordering=-last_accessed`;

				activateBusy(true);
				axios({
					timeout: ajaxTimeout,
					type: "GET",
					url,
					headers: headersAuth,
				})
					.then((response) => {
						rendererCourse(response.data);

						if (Settings.downloadedCourses()) {
							rendererDownloads();
						}

						if (Settings.download().checkNewVersion) {
							checkUpdate(repoAccount, true);
						}
					})
					.catch((error) => {
						console.error("beforeLogin_Error:", error);
						prompt.alert(error.message);
					})
					.finally(() => {
						activateBusy(false);
					});
			})
			.catch((error) => {
				console.error("checkLogin_Error:", error);
				prompt.alert(error.message);
				Settings.accessToken(null);

				resetToLogin();
			})
			.finally(() => {
				console.log("login finish");
			});
	}
}

function loginWithAccessToken() {
	const $formLogin = $(".ui.login .form");

	if ($formLogin.find('input[name="business"]').is(":checked")) {
		if (!$subDomain.val()) {
			prompt.alert("Type Business Name");
			return;
		}
	} else {
		$subDomain.val("www");
	}

	prompt.prompt("Access Token", function (access_token) {
		if (access_token) {
			//const subscriber = $formLogin.find('input[name="subscriber"]').is(":checked");
			const submain = $subDomain.val();
			Settings.accessToken(access_token);
			Settings.subDomain(submain.length == 0 ? "www" : submain);
			//Settings.subscriber(subscriber);
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
		body: "Download finished",
		icon: urlImage ?? __dirname + "/assets/images/build/icon.png",
	});

	notification.onclick = function () {
		shell.openPath(pathCourse);
	};
}

function getSequenceName(index, count, name, separatorIndex = ". ", path = null) {
	const sanitize_name = sanitize(name); //, { replacement: (s) => "? ".indexOf(s) > -1 ? "" : "-", }).trim();

	const index_name = `${index}${separatorIndex}${sanitize_name}`;
	const index_path = path ? `${path}/${index_name}` : index_name;

	const seq = zeroPad(index, count);
	const sequence_name = `${seq}${separatorIndex}${sanitize_name}`;
	const sequence_path = path ? `${path}/${sequence_name}` : sequence_name;

	if (index_path === sequence_path) {
		return {name: index_name, fullPath: index_path};
	} else {
		if (Settings.download().seqZeroLeft) {
			if (fs.existsSync(index_path)) {
				fs.renameSync(index_path, sequence_path);
			}

			return {name: sequence_name, fullPath: sequence_path};
		} else {
			if (fs.existsSync(sequence_path)) {
				fs.renameSync(sequence_path, index_path);
			}

			return {name: index_name, fullPath: index_path};
		}
	}
}

function paginate(array, page_size, page_number) {
	// human-readable page numbers usually start with 1, so we reduce 1 in the first argument
	return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function saveLogFile() {
	if (loggers.length == 0) return;

	dialog
		.showSaveDialog({
			title: "Udeler Log",
			defaultPath: "udeler_logger.txt",
			filters: [{name: "Text File (*.txt)", fileExtension: ["txt"]}],
		})
		.then((result) => {
			if (!result.canceled) {
				let filePath = result.filePath;
				if (!filePath.endsWith(".txt")) filePath += ".txt";

				let content = "";

				loggers.forEach((item) => {
					content += `${item.datetime} - ${item.title}: ${item.description}\n`;
				});

				fs.writeFile(filePath, content, (err) => {
					if (err) {
						appendLog("saveLogFile_Error", err.message);
						// captureException(err);
						return;
					}
					console.log("File successfully create!");
				});
			}
		});
}

process.on("uncaughtException", (error) => {
	appendLog("uncaughtException", error.stack);
	captureException(error);
});

process.on("unhandledRejection", (error) => {
	appendLog("unhandledRejection", error.stack);
	captureException(error);
});

function captureException(exception) {
	if (Sentry) Sentry.captureException(exception);
}

// console.table(getAllDownloadsHistory());
console.log("access-token", Settings.accessToken());

checkLogin();