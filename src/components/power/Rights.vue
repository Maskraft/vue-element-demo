<template>
  <div>
    <!-- Breadcrumb Navi -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">ホーム</el-breadcrumb-item>
      <el-breadcrumb-item>権限管理</el-breadcrumb-item>
      <el-breadcrumb-item>権限リスト</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card View -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="権限名称" prop="authName"></el-table-column>
        <el-table-column label="パス" prop="path"></el-table-column>
        <el-table-column label="権限レベル" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">レベル１</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success">レベル２</el-tag>
            <el-tag v-else type="warning">レベル３</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('権限リスト取得失敗')
      }
      this.rightsList = res.data
      // console.log(this.rightsList)
    }
  }
}
</script>

<style lang="less" scoped>
</style>