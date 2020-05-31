<template>
  <div>
    <!-- Breadcrumb Navi -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">ホーム</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品カテゴリ</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card View -->
    <el-card>
      <!-- Add Cate-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">カテゴリ追加</el-button>
        </el-col>
      </el-row>

      <!-- Tree Table -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 有効か 列 -->
        <template slot="isok" slot-scope="scope">
          <i
            style="color: lightgreen;"
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i style="color: red;" class="el-icon-error" v-else></i>
        </template>

        <!-- カテゴリレベル 列 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">レベル１</el-tag>
          <el-tag size="mini" v-else-if="scope.row.cat_level === 1" type="success">レベル２</el-tag>
          <el-tag size="mini" v-else type="warning">レベル３</el-tag>
        </template>

        <!-- 操作 列 -->
        <template slot="opt" slot-scope>
          <el-button size="mini" type="primary" icon="el-icon-edit">編集</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">削除</el-button>
        </template>
      </tree-table>

      <!-- Pagination -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- Add Cate Dialog -->
    <el-dialog
      title="カテゴリ追加"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="120px"
      >
        <el-form-item label="カテゴリ名：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="親カテゴリ：">
          <!-- optionsでデータを指定 -->
          <!-- propsでconfig Objを指定 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="addCate">確 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      total: 0,
      columns: [
        {
          label: 'カテゴリ名',
          prop: 'cat_name'
        },
        {
          label: '有効か',
          type: 'template',
          template: 'isok'
        },
        {
          label: 'カテゴリレベル',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: 'カテゴリ名を入力してください',
            trigger: 'blur'
          }
        ]
      },
      parentCateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('カテゴリリスト取得失敗')
      }
      // console.log(res.data)
      this.cateList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('親カテゴリ取得失敗')
      }
      // console.log(res.data)
      this.parentCateList = res.data
    },
    parentCateChange() {
      console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        // カテゴリIDのArray
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 現在のカテゴリレベル
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addCate() {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('カテゴリ追加失敗')
        }
        this.$message.success('カテゴリ追加成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>