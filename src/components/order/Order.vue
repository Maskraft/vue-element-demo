<template>
  <div>
    <!-- Breadcrumb Navi -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">ホーム</el-breadcrumb-item>
      <el-breadcrumb-item>注文管理</el-breadcrumb-item>
      <el-breadcrumb-item>注文リスト</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card View -->
    <el-card>
      <!-- Search Bar -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="内容を入力してください" clearable>
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- Order List -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="注文番号" prop="order_number"></el-table-column>
        <el-table-column label="合計金額" prop="order_price"></el-table-column>
        <el-table-column label="決済状況" prop="pay_status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success">決済完了</el-tag>
            <el-tag v-else type="danger">未決済</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="出荷状況" prop="is_send">
          <template slot-scope="scope">{{scope.row.is_send}}</template>
        </el-table-column>
        <el-table-column label="注文日時" prop="create_time">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope>
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showShipBox"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- Edit Address Dialog -->
    <el-dialog
      title="住所を編集"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="都道府県" prop="address1">
          <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="詳細住所" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="addressVisible = false">確 定</el-button>
      </span>
    </el-dialog>

    <!-- Ship Dialog -->
    <el-dialog title="配送状況" :visible.sync="shipVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in shipInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'

export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      ordersList: [],
      addressVisible: false,
      addressForm: {
        address1: [],
        address1: ''
      },
      addressFormRules: {
        address1: [
          {
            required: true,
            message: '都道府県を選んでください',
            trigger: 'blur'
          }
        ],
        address2: [
          {
            required: true,
            message: '詳細住所を入力してください',
            trigger: 'blur'
          }
        ]
      },
      cityData,
      shipVisible: false,
      shipInfo: []
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    async getOrdersList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('注文リスト取得失敗')
      }
      this.total = res.data.total
      this.ordersList = res.data.goods
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },
    showBox() {
      this.addressVisible = true
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    async showShipBox() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('配送状況取得失敗')
      }
      this.shipInfo = res.data
      this.shipVisible = true
      console.log(this.shipInfo)
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>