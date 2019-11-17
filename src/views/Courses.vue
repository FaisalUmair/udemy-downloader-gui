<template>
  <el-main v-loading="isLoading">
    <el-row v-if="courses.length || searched" class="p-4">
      <el-form @submit.native.prevent="searchCourses()">
        <el-input placeholder="Search Courses" v-model="search">
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
      </el-form>
    </el-row>
    <Course
      v-for="(course) in courses"
      :key="course.id"
      :name="course.title"
      :image="course.image_125_H"
      :id="course.id"
      v-show="course.show"
    />
    <el-row v-if="next" class="p-4">
      <el-button class="w-full" type="primary" round @click="loadCourses(next)">Load More</el-button>
    </el-row>
  </el-main>
</template>

<script>
import { settings } from "@/db";
import router from "@/router";
import axios from "axios";
import Course from "@/components/Course";

export default {
  data() {
    return {
      next: false,
      courses: [],
      isLoading: false,
      search: "",
      searched: false,
      access_token: ""
    };
  },
  methods: {
    loadCourses(url) {
      this.isLoading = true;
      axios
        .get(url, {
          headers: {
            Authorization: "Bearer " + this.access_token
          }
        })
        .then(response => {
          this.isLoading = false;
          if (this.searched) {
            this.courses = this.courses.map(course => {
              return { ...course, show: false };
            });
            this.searched = false;
          }
          let dataFiltered = response.data.results.filter(course => {
            let result = false;
            this.courses.forEach(presentCourse => {
              if (course.id == presentCourse.id) {
                presentCourse.show = true;
                result = true;
              }
            });
            if (!result) {
              return true;
            }
          });
          let data = dataFiltered.map(course => {
            return { ...course, show: true };
          });
          this.courses = this.courses.concat(data);
          this.next = response.data.next;
        })
        .catch(error => {
          if ([401, 403].indexOf(error.response.status) > -1) {
            settings.update({}, { $set: { access_token: null } });
            router.push("/login");
          }
        });
    },
    searchCourses() {
      this.searched = true;
      this.loadCourses(
        "https://www.udemy.com/api-2.0/users/me/subscribed-courses?page_size=50&page=1&search=" +
          this.search
      );
    },
    showDownloads() {
      router.push("/downloads");
    }
  },
  created() {
    settings.findOne(
      { access_token: { $exists: true, $ne: null } },
      (err, result) => {
        if (result) {
          this.access_token = result.access_token;
          this.loadCourses(
            "https://www.udemy.com/api-2.0/users/me/subscribed-courses?page_size=50"
          );
        } else {
          router.push("/login");
        }
      }
    );
  },
  components: {
    Course
  }
};
</script>