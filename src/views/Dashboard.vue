<template>
  <el-container>
    <el-aside width="60px">
      <el-menu default-active="1">
        <el-menu-item index="1" @click="showCourses()">
          <i class="el-icon-menu"></i>
        </el-menu-item>
        <el-menu-item index="2" @click="showSettings()">
          <i class="el-icon-setting"></i>
        </el-menu-item>
        <el-menu-item index="3">
          <i class="el-icon-info"></i>
        </el-menu-item>
        <el-menu-item index="4" @click="logout()">
          <i class="el-icon-circle-close"></i>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <keep-alive>
      <router-view />
    </keep-alive>
  </el-container>
</template>


<script>
import router from "@/router";
import { settings } from "@/db";
export default {
  methods: {
    showCourses() {
      router.push("/courses");
    },
    showSettings() {
      router.push("/settings");
    },
    logout() {
      this.$confirm("Are you sure you want to logout?", {
        type: "warning"
      })
        .then(() => {
          settings.update({}, { $set: { access_token: null } });
          router.push("/login");
        })
        .catch(() => {});
    }
  },
  created() {
    if (this.$route.path == "/") {
      settings.findOne(
        { access_token: { $exists: true, $ne: null } },
        (err, result) => {
          if (result) {
            router.push("/courses");
          } else {
            router.push("/login");
          }
        }
      );
    }
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