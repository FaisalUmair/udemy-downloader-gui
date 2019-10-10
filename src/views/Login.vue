<template>
  <el-container v-loading="usingAuthenticator" element-loading-text="Awating Login Request...">
    <el-form>
    <el-dialog center title="Access Token" :close-on-click-modal="false" :visible.sync="usingAccessToken" width="80%">
      <el-form>
        <el-form-item> 
          <el-input v-model="accessToken"></el-input>
        </el-form-item>
        <el-form-item> 
          <el-button type="primary" class="w-full">Submit</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

      <el-form-item class="text-center">
          <v-icon name="user-secret" scale="4" class="text-grey-darker border-4 border-grey-dark rounded-full py-4 px-5"></v-icon>
      </el-form-item>

        <el-form-item class="text-center">  
            <el-checkbox label="Udemy Business ?" class="w-full bg-grey-lightest" name="type" v-model="isBusiness" border></el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-input v-if="isBusiness" placeholder="Udemy Business Name" v-model="buinesssName"></el-input>
        </el-form-item>

      <el-form-item>
        <el-button type="success" class="w-full" plain round @click="loginWithUdemy()">Login Using Credentials</el-button>
      </el-form-item>

      <el-form-item>
        <el-button-group class="w-full">
          <el-button type="warning" plain round size="medium" class="w-1/2" @click="useAuthenticator()"><v-icon name="user-secret"/> Authenticator</el-button>
          <el-button type="danger" plain round size="medium" class="w-1/2" @click="useAccessToken()"><v-icon name="key"/> Access Token</el-button>
        </el-button-group>
      </el-form-item>
      
    </el-form>
  </el-container>
</template>


<script>
import {settings} from '@/db'
import router from '@/router'
const remote = window.require("electron").remote;
const parent = remote.getCurrentWindow();
const dimensions = parent.getSize();
const session = remote.session;
const BrowserWindow = remote.BrowserWindow;
export default {
  data() {
    return {
        isBusiness: false,
        buinesssName: "",
        usingAccessToken: false,
        accessToken: "",
        usingAuthenticator: false,
        udemyLoginWindow: false
    };
  },
  methods: {
    useAccessToken(){
      this.usingAccessToken = !this.usingAccessToken;
    },
    useAuthenticator(){
      this.usingAuthenticator = !this.usingAuthenticator;
    },
    loginWithUdemy(){
      if(this.isBusiness){
        if(!this.buinesssName){
            this.$message({
              message: 'Type Business Name',
              type: 'error'
            });
          return;
        }
      }
      let udemyLoginWindow = new BrowserWindow({
        width: dimensions[0] - 100,
        height: dimensions[1] - 100,
        modal: true,
        parent
      });
      udemyLoginWindow.loadURL(`https://www.udemy.com/join/login-popup`);
      this.udemyLoginWindow = udemyLoginWindow;
    }
  },
  created(){
      session.defaultSession.webRequest.onBeforeSendHeaders({urls: ['*://*.udemy.com/*']}, (request,callback) => {
      if(request.requestHeaders.Authorization){
          settings.update({},{$set:{access_token:request.requestHeaders.Authorization.split(' ')[1]}});
          this.udemyLoginWindow.destroy();
          session.defaultSession.clearStorageData();
          router.push("/");
        }
        callback({ requestHeaders: request.requestHeaders })  
      });
  }
};
</script>

<style scoped>
  .el-container {
    display: flex;
    height: 100%;
    align-items: center;
  }
  form {
    flex: 1;
    max-width: 60%;
    margin: 0 auto;
  }
</style>
