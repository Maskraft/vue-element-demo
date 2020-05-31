<template>
  <div>
    <!-- Breadcrumb Navi -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">ホーム</el-breadcrumb-item>
      <el-breadcrumb-item>権限管理</el-breadcrumb-item>
      <el-breadcrumb-item>ロールリスト</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card View -->
    <el-card>
      <!-- Add Role-->
      <el-row>
        <el-col>
          <el-button type="primary">ロール追加</el-button>
        </el-col>
      </el-row>

      <!-- Roles List -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['vcenter','bdbottom', i1===0 ? 'bdtop':'']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- Level 1 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  :class="['vcenter',i2===0 ? '':'bdtop']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- Level 2 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- Level 3 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="ロール名称" prop="roleName"></el-table-column>
        <el-table-column label="ロール説明" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="290px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">編集</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">削除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >権限変更</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Set Right Dialog -->
    <el-dialog
      title="権限変更"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDIalogClosed"
    >
      <!-- Tree View -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="allotRights">確 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      rightsList: [],
      setRightDialogVisible: false,
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defaultKeys: [],
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('ロールリスト取得失敗')
      }
      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    async removeRightById(role, rightId) {
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

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('権限削除失敗')
      }
      // this.getRolesList() 全ページリロード
      role.children = res.data // List Viewだけリロード
    },
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('権限削除失敗')
      }
      this.rightsList = res.data
      // console.log(this.rightsList)

      this.getLeafKeys(role, this.defaultKeys)

      this.setRightDialogVisible = true
    },
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      // 再帰的に全node.idを取得
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    setRightDIalogClosed() {
      this.defaultKeys = []
    },
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys);
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('権限変更失敗')
      }
      this.$message.success('権限変更成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>