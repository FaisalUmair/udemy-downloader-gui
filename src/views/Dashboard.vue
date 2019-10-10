<template>
  <el-container v-loading="isLoading">
    <el-aside width="60px">
      <el-menu default-active="1">
        <el-menu-item index="1">
          <i class="el-icon-menu"></i>
        </el-menu-item>
        <el-menu-item index="2">
          <i class="el-icon-download"></i>
        </el-menu-item>
        <el-menu-item index="3">
          <i class="el-icon-setting"></i>
        </el-menu-item>
        <el-menu-item index="4">
          <i class="el-icon-info"></i>
        </el-menu-item>
        <el-menu-item index="5" @click="logout()">
          <i class="el-icon-circle-close"></i>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>

      <el-row v-if="courses.length || searched" class="p-4">
        <el-form @submit.native.prevent="searchCourses()">
            <el-input placeholder="Search Courses" v-model="search">
                <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
        </el-form>
      </el-row>

      <Course
        v-for="(course,id) in courses"
        :key="id"
        :name="course.title"
        :image="course.image_125_H"
        :id="course.id"
      />
      <el-row v-if="next" class="p-4">
      <el-button class="w-full" type="primary" round @click="loadCourses(next)">Load More</el-button>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import {settings} from '@/db'
import router from '@/router'
import axios from "axios";
import Course from "@/views/Course";

export default {
  data() {
    return {
      next : false,
      courses: [],
      isLoading: false,
      search: "",
      searched : false,
      access_token: ""
    };
  },
  methods: {
    loadCourses(url) {
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
            this.searched ? this.courses = [] : null;
            this.courses = this.courses.concat(response.data.results);
            this.next = response.data.next;
          }).catch(error=>{
            if([401,403].indexOf(error.response.status) > -1) {
              settings.update({},{$set:{access_token:null}});
              router.push("/login");
            }
          })
    },
    searchCourses(){
      this.searched = true;
      this.loadCourses('https://www.udemy.com/api-2.0/users/me/subscribed-courses?page_size=50&page=1&search='+this.search);
    },
    logout(){
      this.$confirm('Are you sure you want to logout?',{
        type: 'warning'
      }).then(() => {
            settings.update({},{$set:{access_token:null}});
            router.push("/login");
          })
          .catch(() => {});
    }
  },
  created() {
      settings.findOne({access_token: {$exists:true, $ne : null}},(err,result) => {
        if(result){
          this.access_token = result.access_token;
          this.loadCourses("https://www.udemy.com/api-2.0/users/me/subscribed-courses?page_size=50");
        }else{
          router.push('/login');
        }
      });
  },
  components: {
    Course
  }
};
</script>


<style scoped>
.el-container {
  height: 100%;
}
.el-menu {
  height: 100%;
  position: fixed;
  width: inherit;
}
.el-main {
  padding: 0;
}
</style>