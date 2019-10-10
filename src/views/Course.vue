<template>
  <el-card v-loading="isLoading">
    <el-row :gutter="20">
      <el-col :span="8">
        <img :src="image">
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
            <el-progress :percentage="overallProgress" type="circle" width="30" :show-text="false"></el-progress>
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
import {settings} from '@/db'
export default {
  props: ["image", "name","id"],
  data() {
    return {
      isLoading: false,
      hasStarted: true,
      isDownloading: false,
      isPaused: false,
      isCompleted: false,
      currentProgress: 30,
      overallProgress: 70,
      lastByte : 0,
      curriculum: [],
      toDownload : 0
    };
  },
  methods: {
    startDownload() {
      settings.findOne({access_token: {$exists:true, $ne : null}},(err,result) => {
        if(result){
          this.access_token = result.access_token;
          this.getCourseInfo(`https://www.udemy.com/api-2.0/courses/${this.id}/cached-subscriber-curriculum-items?page_size=100000`);
        }else{
          router.push('/login');
        }
      });
    },
    getCourseInfo(url){
        this.isLoading = true;
        axios
          .get(
            url,
            {
              headers: {
                Authorization: "Bearer "+this.access_token
              }
            }
          )
          .then(response => {
            this.isLoading = false;
            this.curriculum = response.data;
          }).catch(error=>{
            if([401,403].indexOf(error.response.status) > -1) {
              settings.update({},{$set:{access_token:null}});
              router.push("/login");
            }
            this.isLoading = false;
          })
    },
    getLectureInfo(url){

    },
    download(url){
      
    },
    pauseDownload() {
      this.isDownloading = false;
      this.isPaused = true;
    },
    resumeDownload() {
      this.isDownloading = true;
      this.isPaused = false;
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

