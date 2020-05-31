<template>
  <div>
    <!-- Breadcrumb Navi -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">ホーム</el-breadcrumb-item>
      <el-breadcrumb-item>ユーザー管理</el-breadcrumb-item>
      <el-breadcrumb-item>ユーザーリスト</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card View -->
    <el-card>
      <!-- Search and Insert -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            clearable
            @clear="getUserList"
            placeholder="内容を入力してください"
            v-model="queryInfo.query"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">ユーザー追加</el-button>
        </el-col>
      </el-row>
      <!-- User List -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="ユーザー名" prop="username"></el-table-column>
        <el-table-column label="メールアドレス" prop="email"></el-table-column>
        <el-table-column label="電話番号" prop="mobile"></el-table-column>
        <el-table-column label="権限ロール" prop="role_name"></el-table-column>
        <el-table-column label="状態">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- Edit Button-->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- Delete Button -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- Change Role Button -->
            <el-tooltip effect="dark" content="ロール変更" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- Pagination -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- Add User Dialog -->
    <el-dialog title="ユーザー追加" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="125px">
        <el-form-item label="ユーザー名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="パスワード" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="メールアドレス" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="電話番号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="addUser">追 加</el-button>
      </span>
    </el-dialog>

    <!-- Edit User Dialog -->
    <el-dialog
      title="ユーザー編集"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="125px">
        <el-form-item label="ユーザー名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="メールアドレス" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="電話番号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="editUserInfo">確 定</el-button>
      </span>
    </el-dialog>

    <!-- Set Role Dialog -->
    <el-dialog
      title="ロール変更"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>現在のユーザー：{{userInfo.username}}</p>
        <p>現在のロール：{{userInfo.role_name}}</p>
        <p>
          ロール変更：
          <el-select v-model="selectedRoleId" placeholder="選んでください">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="saveRoleInfo">確 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // Email Validator
    let checkEmail = (rule, value, callBack) => {
      // メールアドレスチェック用の正規表現
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callBack()
      }
      callBack(new Error('正しいメールアドレスを入力してください'))
    }

    // Mobile Validator
    let checkMobile = (rule, value, callBack) => {
      // メールアドレスチェック用の正規表現
      const regMobile = /^(0?[789]0)([0-9]{8})$/
      if (regMobile.test(value)) {
        return callBack()
      }
      callBack(new Error('正しい電話番号を入力してください'))
    }

    return {
      queryInfo: {
        query: '',
        pagenum: 1, // 現在のページナンバー
        pagesize: 2 // 1ページあたり表示数
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      setRoleDialogVisible: false,
      userInfo: {},
      rolesList: [],
      selectedRoleId: '',
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {},
      addFormRules: {
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
        ],
        email: [
          {
            required: true,
            message: 'メールアドレスを入力してください',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '電話番号を入力してください',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      editFormRules: {
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
        email: [
          {
            required: true,
            message: 'メールアドレスを入力してください',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '電話番号を入力してください',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200)
        return this.$message.error('ユーザーリスト取得失敗')

      this.userList = res.data.users
      this.total = res.data.total
    },
    // ページサイズ変更を監視
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // ページナンバー変更を監視
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // スイッチ状態を監視し、APIでデータを操作する
    async userStateChanged(userInfo) {
      // console.log(userInfo)

      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )

      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('状態更新失敗')
      }

      this.$message.success('状態更新成功')
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post('users', this.addForm)

        if (res.meta.status !== 201) {
          return this.$message.error('ユーザー追加失敗')
        }

        this.$message.success('ユーザー追加成功')
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('クエリ失敗')
      }

      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.editForm = {}
      this.$refs.editFormRef.resetFields()
    },
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('編集失敗')
        }

        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('編集成功')
      })
    },
    async removeUserById(id) {
      const result = await this.$confirm(
        'このユーザーを削除してもよろしいですか？',
        '注意',
        {
          confirmButtonText: '確定',
          cancelButtonText: 'キャンセル',
          type: 'warning'
        }
      ).catch(err => err)

      // console.log(result)
      // String: confirm | cancel
      if (result !== 'confirm') {
        return this.$message.info('操作をキャンセルしました')
      }

      const { data: res } = await this.$http.delete('users/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('削除失敗')
      }

      this.$message.success('削除成功')
      this.getUserList()
    },
    async setRole(userInfo) {
      this.userInfo = userInfo

      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('ロールリスト取得失敗')
      }
      this.rolesList = res.data

      this.setRoleDialogVisible = true
    },
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('ロールを選んでください')
      }

      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('ロール更新失敗')
      }
      this.$message.success('ロール更新成功')

      this.getUserList()
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
</style>