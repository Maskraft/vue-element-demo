<template>
  <div>
    <!-- Breadcrumb Navi -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">ホーム</el-breadcrumb-item>
      <el-breadcrumb-item>統計分析</el-breadcrumb-item>
      <el-breadcrumb-item>グラフ</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card View -->
    <el-card>
      <!-- ECharts Dom -->
      <div id="main" style="width: 750px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'

export default {
  data() {
    return {
      options: {
        title: {
          text: 'ユーザー分布'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {},
  async mounted() {
    var myChart = echarts.init(document.getElementById('main'))

    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('統計データ取得失敗')
    }

    const result = _.merge(res.data, this.options)

    myChart.setOption(result)
  },
  methods: {}
}
</script>

<style lang="less" scoped>
</style>