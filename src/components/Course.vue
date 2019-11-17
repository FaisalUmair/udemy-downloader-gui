<template>
  <el-card v-loading="isLoading">
    <el-row :gutter="20">
      <el-col :span="8">
        <img :src="image" />
      </el-col>
      <el-col :span="16">
        {{name}}
        <el-row class="pt-3">
          <el-col :span="21">
            <el-button type="primary" circle :disabled="hasStarted" @click="startDownload()">
              <v-icon name="download"></v-icon>
            </el-button>
            <el-button type="warning" circle :disabled="!isDownloading" @click="pauseDownload()">
              <v-icon name="pause"></v-icon>
            </el-button>
            <el-button type="success" circle :disabled="!isPaused" @click="resumeDownload()">
              <v-icon name="play"></v-icon>
            </el-button>
          </el-col>
          <el-col :span="3" v-if="hasStarted">
            <el-progress
              :percentage="(totalDownloaded/toDownload)*100"
              type="circle"
              :width="30"
              :show-text="false"
            ></el-progress>
          </el-col>
        </el-row>
        <el-row class="pt-3" v-if="hasStarted">
          <el-progress :percentage="currentProgress"></el-progress>
        </el-row>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import axios from "axios";
import Downloader from "mt-files-downloader";
import sanitize from "sanitize-filename";
import fs from "fs";
import mkdirp from "mkdirp";

let download_directory = "/Users/faisalumair/Downloads";
import { settings, downloads } from "@/db";
export default {
  props: ["image", "name", "id"],
  data() {
    return {
      isLoading: false,
      hasStarted: false,
      isDownloading: false,
      isPaused: false,
      isCompleted: false,
      currentProgress: 0,
      overallProgress: 0,
      toDownload: 0,
      totalDownloaded: 0,
      currentIndex: 0,
      lectureIndex: 0,
      chapterIndex: 0,
      chapterName: "",
      stopped: false
    };
  },
  methods: {
    startDownload() {
      settings.findOne(
        { access_token: { $exists: true, $ne: null } },
        (err, result) => {
          if (result) {
            this.access_token = result.access_token;
            this.getCourseInfo(
              `https://www.udemy.com/api-2.0/courses/${this.id}/cached-subscriber-curriculum-items?page_size=100000`
            );
          } else {
            router.push("/login");
          }
        }
      );
    },
    getCourseInfo(url) {
      this.isLoading = true;
      axios
        .get(url, {
          headers: {
            Authorization: "Bearer " + this.access_token
          }
        })
        .then(response => {
          this.isLoading = false;
          this.curriculum = response.data;

          this.curriculum.results.forEach((entity, index) => {
            if (
              entity._class == "lecture" &&
              (entity.asset.asset_type == "Video" ||
                entity.asset.asset_type == "Article" ||
                entity.asset.asset_type == "File" ||
                entity.asset.asset_type == "E-Book")
            ) {
              this.toDownload++;
            }
          });

          this.hasStarted = true;
          this.checkEntity(0);
        })
        .catch(error => {
          if ([401, 403].indexOf(error.response.status) > -1) {
            settings.update({}, { $set: { access_token: null } });
            router.push("/login");
          }
          this.isLoading = false;
        });
    },
    getLectureInfo(url) {},
    checkEntity(index) {
      if (this.stopped) {
        return;
      }
      if (this.totalDownloaded == this.toDownload) {
        console.log("Download Completed");
        return;
      }
      let entity = this.curriculum.results[index];
      if (entity._class == "chapter") {
        this.chapterName = entity.title;
        mkdirp(
          download_directory + "/" + this.name + "/" + this.chapterName,
          () => {
            this.chapterIndex++;
            this.checkEntity(++this.currentIndex);
          }
        );
      } else if (
        entity._class == "lecture" &&
        (entity.asset.asset_type == "Video" ||
          entity.asset.asset_type == "Article" ||
          entity.asset.asset_type == "File" ||
          entity.asset.asset_type == "E-Book")
      ) {
        this.resolveEntity(this.id, entity.id, entity.asset.asset_type);
      } else {
        this.checkEntity(++this.currentIndex);
      }
    },
    resolveEntity(courseId, entityId, entityType) {
      axios
        .get(
          `https://www.udemy.com/api-2.0/users/me/subscribed-courses/${courseId}/lectures/${entityId}?fields[asset]=stream_urls,download_urls,captions,title,filename,data,body&fields[lecture]=asset,supplementary_assets`,
          {
            headers: {
              Authorization: "Bearer " + this.access_token
            }
          }
        )
        .then(response => {
          this.downloadEntity(response.data, entityType);
        })
        .catch(error => {
          console.log(error);
        });
    },
    downloadEntity(response, entityType) {
      this.currentProgress = 0;
      this.lectureIndex++;
      let entityName = response.asset.title;
      // Download the entity and see if there is another one to download

      if (entityType == "Article") {
        if (response.asset.data) {
          var src = response.asset.data.body;
        } else {
          var src = response.asset.body;
        }
        var videoQuality = entityType;
        var type = "Article";
      } else if (entityType == "File" || entityType == "E-Book") {
        var src = response.asset.download_urls[entityType][0].file;
        var videoQuality = entityType;
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
        var videoQuality = "Auto";
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

      this.downloader = new Downloader();

      const dlStart = dl => {
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

        let timer = setInterval(() => {
          if (this.stopped) {
            clearInterval(timer);
          }
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
              //$download_speed_value.html(0);
              break;
            case 1:
              var stats = dl.getStats();
              //$download_speed_value.html(parseInt(stats.present.speed/1000) || 0);
              //$progressElemIndividual.progress('set percent',stats.total.completed);
              this.currentProgress = stats.total.completed;
              break;
            case 2:
              break;
            case -1:
              var stats = dl.getStats();
              //$download_speed_value.html(parseInt(stats.present.speed/1000) || 0);
              this.currentProgress = stats.total.completed;
              //$progressElemIndividual.progress('set percent',stats.total.completed);
              if (
                dl.stats.total.size == 0 &&
                dl.status == -1 &&
                fs.existsSync(dl.filePath)
              ) {
                dl.emit("end");
                clearInterval(timer);
                break;
              } else {
                console.log("here");
                // $.ajax({
                //   type: "HEAD",
                //   url: dl.url,
                //   error: function(error) {
                //     if (error.status == 401 || error.status == 403) {
                //       fs.unlinkSync(dl.filePath);
                //     }
                //     //resetCourse($course.find(".download-error"));
                //   },
                //   success: function() {
                //     //resetCourse($course.find(".download-error"));
                //   }
                // });
                // clearInterval(timer);
                // break;
              }
            default:
            //$download_speed_value.html(0);
          }
        }, 1000);

        dl.on("error", () => {
          // Prevent throwing uncaught error
        });

        dl.on("start", () => {
          this.isPaused = false;
        });

        dl.on("end", () => {
          this.totalDownloaded++;
          this.currentProgress = 100;
          this.checkEntity(++this.currentIndex);
        });
      };

      if (type == "Article" || type == "File") {
        fs.writeFile(
          download_directory +
            "/" +
            this.name +
            "/" +
            this.chapterName +
            "/" +
            sanitize(this.lectureIndex + ". " + entityName.trim() + ".html"),
          src,
          () => {
            this.currentProgress = 100;
            this.totalDownloaded++;
            this.checkEntity(++this.currentIndex);
            // if(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets']){
            //   var total_assets = coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'].length;
            //   var index = 0;
            //   downloadAttachments(index,total_assets);
            // }else{
            //   $progressElemCombined.progress('increment');
            //   downloaded++;
            //   downloadLecture(chapterindex,++lectureindex,num_lectures,chapter_name);
            // }
          }
        );
      } else {
        entityName = sanitize(
          this.lectureIndex +
            ". " +
            entityName.trim() +
            "." +
            (type == "File"
              ? new URL(src).searchParams
                  .get("filename")
                  .split(".")
                  .pop()
              : "mp4")
        );
        if (
          fs.existsSync(
            download_directory +
              "/" +
              this.name +
              "/" +
              this.chapterName +
              "/" +
              entityName +
              ".mtd"
          )
        ) {
          var dl = this.downloader.resumeDownload(
            download_directory +
              "/" +
              this.name +
              "/" +
              this.chapterName +
              "/" +
              entityName
          );
          if (
            !fs.statSync(
              download_directory +
                "/" +
                this.name +
                "/" +
                this.chapterName +
                "/" +
                entityName +
                ".mtd"
            ).size
          ) {
            dl = this.downloader.download(
              src,
              download_directory +
                "/" +
                this.name +
                "/" +
                this.chapterName +
                "/" +
                entityName
            );
          }
        } else if (
          fs.existsSync(
            download_directory +
              "/" +
              this.name +
              "/" +
              this.chapterName +
              "/" +
              entityName
          )
        ) {
          this.currentProgress = 100;
          this.totalDownloaded++;
          this.checkEntity(++this.currentIndex);
          return;
        } else {
          var dl = this.downloader.download(
            src,
            download_directory +
              "/" +
              this.name +
              "/" +
              this.chapterName +
              "/" +
              entityName
          );
        }

        dlStart(dl);
      }
    },
    pauseDownload() {
      this.isDownloading = false;
      this.isPaused = true;
    },
    resumeDownload() {
      this.isDownloading = true;
      this.isPaused = false;
    }
  },
  updated() {
    downloads.update(
        { id: this.id },
        { ...this.$data, id: this.id },
        { upsert: true }
      );
  },
  mounted() {
    downloads.findOne({ id: this.id }, (err, course) => {
      if (course) {
        this.hasStarted = course.hasStarted;
        this.currentProgress = course.currentProgress;
        this.overallProgress = course.overallProgress;
      }
    });
  },
  beforeDestroy() {
    if (this.downloader) {
          this.downloader._downloads.forEach(download => {
            download.stop();
            this.stopped = true;
    });
    }
  }
};
</script>


<style scoped>
.el-card {
  box-shadow: none;
  border-radius: 0;
  font-size: 0.9em;
  line-height: 1.3;
}
.el-button {
  padding: 7px 10px;
}
</style>