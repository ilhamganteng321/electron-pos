import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import PropTypes from 'prop-types'

RevenueExpenseChart.propTypes = {
  data: PropTypes.array
}
export function RevenueExpenseChart({ data }) {
  const chartRef = useRef(null)

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderRadius: 12,
          textStyle: { color: '#fff', fontSize: 12 }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
          show: false
        },
        legend: {
          data: ['Revenue', 'Expense'],
          textStyle: { color: 'rgba(255, 255, 255, 0.6)' },
          itemWidth: 12,
          itemHeight: 12,
          borderRadius: 6,
          right: 0,
          top: 0
        },
        xAxis: {
          type: 'category',
          data: data.labels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: 11
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: { color: 'rgba(255, 255, 255, 0.05)', type: 'dashed' }
          },
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: 11,
            formatter: (value) => `Rp ${(value / 1000).toFixed(0)}k`
          },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        series: [
          {
            name: 'Revenue',
            type: 'bar',
            data: data.revenue,
            barWidth: '35%',
            borderRadius: [8, 8, 0, 0],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#059669' }
              ])
            },
            label: {
              show: false
            }
          },
          {
            name: 'Expense',
            type: 'bar',
            data: data.expense,
            barWidth: '35%',
            borderRadius: [8, 8, 0, 0],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#ef4444' },
                { offset: 1, color: '#dc2626' }
              ])
            }
          }
        ],
        backgroundColor: 'transparent'
      }

      chart.setOption(option)

      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.dispose()
      }
    }
  }, [data])

  return <div ref={chartRef} className="w-full h-80" />
}
