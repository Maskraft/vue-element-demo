<template>
  <div class="login_container">
    <div class="login_box">
      <!-- Avatar -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- Login Form -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        label-width="0px"
        class="login_form"
      >
        <!-- Username -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <!-- Password -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
        </el-form-item>
        <!-- Button -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">ログイン</el-button>
          <el-button type="info" @click="resetLoginForm">リセット</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // Bind Data
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // Validate
      loginFormRules: {
        username: [
          {
            required: true,
            message: 'ユーザー名を入力してください',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '長さの範囲は 3 ~ 10 文字です',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: 'パスワードを入力してください',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '長さの範囲は 6 ~ 15 文字です',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('ログイン失敗')
        this.$message.success('ログイン成功')
        // ログイン成功後に、トークンを保存し、homeへリダイレクト
        // console.log(res)
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    },
    resetLoginForm() {
      // console.log(this);
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.avatar_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
