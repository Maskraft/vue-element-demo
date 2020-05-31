<template>
  <el-container class="home_container">
    <!-- Header Area -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt />
        <span>EC管理システム</span>
      </div>
      <el-button type="info" @click="logout">ログアウト</el-button>
    </el-header>
    <!-- Body Area -->
    <el-container>
      <!-- Left Colum -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle_button" @click="toggleCollapse">|||</div>
        <!-- Navi Menu-->
        <el-menu
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409bff"
        >
          <!-- Menu Level 1 -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <!-- Menu Template -->
            <template slot="title">
              <!-- Icon -->
              <i :class="iconsObj[item.id]"></i>
              <!-- Text -->
              <span>{{item.authName}}</span>
            </template>
            <!-- Menu Level 2 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveState('/'+subItem.path)"
            >
              <!-- Menu Template -->
              <template slot="title">
                <!-- Icon -->
                <i class="el-icon-folder"></i>
                <!-- Text -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- Main -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // Menu Data
      menuList: [],
      iconsObj: {
        '125': 'el-icon-s-custom',
        '103': 'el-icon-magic-stick',
        '101': 'el-icon-s-goods',
        '102': 'el-icon-s-order',
        '145': 'el-icon-s-data'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  // padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    > img {
      height: 30px;
    }
    > span {
      margin: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle_button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.1em;
  cursor: pointer;
}
</style>